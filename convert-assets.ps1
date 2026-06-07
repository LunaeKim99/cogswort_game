<#
.SYNOPSIS
    Converts Canva AI Magic Media JPG exports into production-ready PNG game assets
    for "Cogsworth: Last Wind" — a Phaser 3 steampunk platformer.

.DESCRIPTION
    Takes raw JPG files from Canva AI output and processes them into properly sized,
    optionally transparent PNG assets suitable for a 16-bit pixel-art game.

    Processing varies by asset type (detected via filename prefix):
      - Backgrounds (bg-*):       JPG->PNG, resize to 800x450, no transparency.
      - Sprites, UI, tiles, etc.: Chroma-key background removal + resize with
                                  nearest-neighbor interpolation for crisp pixel art.

.PARAMETER InputDir
    Directory containing raw JPG files from Canva AI.
    Default: "assets/canva/raw"

.PARAMETER OutputDir
    Directory where processed PNG files will be written.
    Default: "assets/images"

.PARAMETER KeyColor
    Hex color (without #) to use as chroma key for transparency removal.
    Default: "FFFFFF" (white background removal).

.PARAMETER DryRun
    If specified, only lists what would be processed without running ffmpeg.

.PARAMETER Verbose
    If specified, shows full ffmpeg output for each file.

.PARAMETER Force
    If specified, reprocesses files even if the output PNG already exists.

.EXAMPLE
    .\convert-assets.ps1
    Processes all JPGs in assets/canva/raw, outputs to assets/images.

.EXAMPLE
    .\convert-assets.ps1 -DryRun -Verbose
    Shows what would be done with full details, without converting.

.EXAMPLE
    .\convert-assets.ps1 -InputDir "my/canva/exports" -Force
    Processes from a custom input directory, overwriting existing PNGs.

.EXAMPLE
    .\convert-assets.ps1 -KeyColor "00FF00"
    Uses green-screen chroma key instead of the default white.
#>

param(
    [string]$InputDir = "assets/canva/raw",

    [string]$OutputDir = "assets/images",

    [string]$KeyColor = "FFFFFF",

    [switch]$DryRun,

    [switch]$Verbose,

    [switch]$Force
)

# ============================================================================
# CONFIGURATION - Asset type mapping
# ============================================================================
# Each prefix maps to a target size, transparency flag, and description.
# Use -1 for width/height to preserve original dimensions.
$AssetTypes = @{
    # Backgrounds (full scene, no transparency needed)
    "bg-level"   = @{ Width = 800;  Height = 450;  Transparent = $false; Desc = "Background" }

    # Player sprites
    "player-"    = @{ Width = 32;   Height = 32;   Transparent = $true;  Desc = "Player sprite" }

    # Enemy sprites (drones / small enemies)
    "enemy-"     = @{ Width = 28;   Height = 28;   Transparent = $true;  Desc = "Enemy sprite" }

    # Walker automaton
    "walker-"    = @{ Width = 32;   Height = 32;   Transparent = $true;  Desc = "Walker sprite" }

    # Flying drone (exact prefix match; also "drone-" for variants)
    "drone"      = @{ Width = 28;   Height = 28;   Transparent = $true;  Desc = "Drone sprite" }
    "drone-"     = @{ Width = 28;   Height = 28;   Transparent = $true;  Desc = "Drone sprite" }

    # Obstacles
    "saw-blade"  = @{ Width = 28;   Height = 28;   Transparent = $true;  Desc = "Obstacle (saw)" }
    "spike-"     = @{ Width = 48;   Height = 32;   Transparent = $true;  Desc = "Obstacle (spike)" }

    # Collectible
    "coin"       = @{ Width = 16;   Height = 16;   Transparent = $true;  Desc = "Collectible" }
    "coin-"      = @{ Width = 16;   Height = 16;   Transparent = $true;  Desc = "Collectible" }

    # Exit gate
    "gate-"      = @{ Width = 48;   Height = 64;   Transparent = $true;  Desc = "Exit gate" }

    # UI hearts
    "heart-"     = @{ Width = 22;   Height = 22;   Transparent = $true;  Desc = "UI heart" }

    # Ground tile (seamless, no transparency)
    "ground-"    = @{ Width = 32;   Height = 32;   Transparent = $false; Desc = "Ground tile" }

    # Particle effects
    "particle"   = @{ Width = 4;    Height = 4;    Transparent = $true;  Desc = "Particle effect" }
    "particle-"  = @{ Width = 4;    Height = 4;    Transparent = $true;  Desc = "Particle effect" }

    # UI buttons
    "btn-"       = @{ Width = 64;   Height = 64;   Transparent = $true;  Desc = "UI button" }

    # Laser effects (variable size, preserve original)
    "laser-"     = @{ Width = -1;   Height = -1;   Transparent = $true;  Desc = "Laser effect" }

    # Icons
    "icon-"      = @{ Width = 32;   Height = 32;   Transparent = $true;  Desc = "Icon" }
}

# ============================================================================
# INTERNAL FUNCTIONS
# ============================================================================

function Write-Banner {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "   Cogsworth: Last Wind - Canva AI Asset Converter" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-KeyValue {
    param([string]$Label, [string]$Value, [string]$Color = "White")
    $padded = ("{0,-30}" -f $Label)
    Write-Host "  $padded" -NoNewline
    Write-Host $Value -ForegroundColor $Color
}

function Get-AssetTypeInfo {
    param([string]$FileName)

    # Strip extension for matching
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)

    # Order keys by length descending so longer prefixes match first
    # (e.g., "particle-" matches before just "particle")
    $sortedKeys = $AssetTypes.Keys | Sort-Object { $_.Length } -Descending

    foreach ($key in $sortedKeys) {
        if ($baseName -like "$key*" -or $baseName -eq $key) {
            $info = $AssetTypes[$key]
            return @{
                Key         = $key
                Width       = $info.Width
                Height      = $info.Height
                Transparent = $info.Transparent
                Description = $info.Desc
            }
        }
    }

    return $null
}

function Convert-Asset {
    <#
    .SYNOPSIS
        Converts a single JPG asset to PNG using ffmpeg with the appropriate
        filter chain for this asset type.
    #>
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [hashtable]$TypeInfo,
        [string]$KeyColorArg,
        [bool]$IsVerbose
    )

    $w = $TypeInfo.Width
    $h = $TypeInfo.Height
    $needsTransparency = $TypeInfo.Transparent

    # Build argument list for Start-Process.
    # Each element is one argument; no manual quoting needed - PowerShell
    # handles that when passing to the process.
    $argList = New-Object System.Collections.ArrayList

    # -- Input file
    $null = $argList.Add("-i")
    $null = $argList.Add($InputPath)

    # -- Filter chain
    if ($needsTransparency) {
        # Chroma-key removal: remove solid background color
        # colorkey=color:similarity:blend
        #   similarity=0.15 (15% tolerance), blend=0.1 (soft edge)
        if ($w -eq -1 -or $h -eq -1) {
            # Preserve original dimensions
            $filter = "colorkey=0x${KeyColorArg}:0.15:0.1,format=rgba"
        } else {
            $filter = "colorkey=0x${KeyColorArg}:0.15:0.1,format=rgba,scale=${w}:${h}:flags=neighbor"
        }
        $null = $argList.Add("-vf")
        $null = $argList.Add($filter)
        $null = $argList.Add("-c:v")
        $null = $argList.Add("png")
    } else {
        # No transparency - just resize if needed
        if ($w -ne -1 -and $h -ne -1) {
            $filter = "scale=${w}:${h}:flags=neighbor"
            $null = $argList.Add("-vf")
            $null = $argList.Add($filter)
        }
        $null = $argList.Add("-pix_fmt")
        $null = $argList.Add("rgb24")
        $null = $argList.Add("-c:v")
        $null = $argList.Add("png")
    }

    # -- Output file (overwrite)
    $null = $argList.Add("-y")
    $null = $argList.Add($OutputPath)

    # Display the command in verbose mode
    if ($IsVerbose) {
        $filteredArgs = $argList -join " "
        Write-Host "        ffmpeg command:" -ForegroundColor DarkGray
        Write-Host "          ffmpeg $filteredArgs" -ForegroundColor DarkGray
    }

    # Build a single argument string for ProcessStartInfo.Arguments
    # (compatible with .NET Framework 4.x / PowerShell 5.1).
    # Each argument that contains spaces needs to be quoted.
    $argParts = @()
    foreach ($a in $argList) {
        if ($a -match '\s') {
            $argParts += "`"$a`""
        } else {
            $argParts += $a
        }
    }
    $argString = $argParts -join " "

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "ffmpeg"
    $psi.Arguments = $argString
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $null = $proc.Start()

    # Read output streams (must read before WaitForExit to avoid deadlock)
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    $exitCode = $proc.ExitCode

    if ($IsVerbose) {
        if ($stdout) { Write-Host "        [stdout] $stdout" -ForegroundColor DarkGray }
        if ($stderr) { Write-Host "        [stderr] $stderr" -ForegroundColor DarkGray }
    }

    return $exitCode
}

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

# Resolve paths relative to script location
$ScriptDir = Split-Path -Parent $PSCommandPath
$InputDirResolved = Join-Path $ScriptDir $InputDir
$OutputDirResolved = Join-Path $ScriptDir $OutputDir

Write-Banner
Write-Host "  Settings:" -ForegroundColor Yellow
Write-KeyValue "Input directory" $InputDirResolved
Write-KeyValue "Output directory" $OutputDirResolved
Write-KeyValue "Chroma key color" "#${KeyColor}"
Write-KeyValue "Dry run" $(if ($DryRun) { "YES" } else { "no" }) $(if ($DryRun) { "Red" } else { "Green" })
Write-KeyValue "Force overwrite" $(if ($Force) { "YES" } else { "no" }) $(if ($Force) { "Red" } else { "Green" })
Write-KeyValue "Verbose output" $(if ($Verbose) { "YES" } else { "no" })
Write-Host ""

# -- Verify ffmpeg exists (skip in dry-run)
if (-not $DryRun) {
    $ffmpegPath = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
    if (-not $ffmpegPath) {
        Write-Host "  [ERROR] ffmpeg is not installed or not in PATH." -ForegroundColor Red
        Write-Host "          Install FFmpeg from https://ffmpeg.org/ and ensure it's in PATH." -ForegroundColor Yellow
        Write-Host "          Or run with -DryRun to preview without converting." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "  [OK] ffmpeg found: $($ffmpegPath.Source)" -ForegroundColor Green
        Write-Host ""
    }
}

# -- Check if input directory exists
if (-not (Test-Path -LiteralPath $InputDirResolved -PathType Container)) {
    Write-Host "  [WARN] Input directory does not exist:" -ForegroundColor Yellow
    Write-Host "         $InputDirResolved" -ForegroundColor Yellow
    Write-Host ""
    if (-not $DryRun) {
        $createInput = Read-Host "  Create input directory now? (y/N)"
        if ($createInput -eq "y" -or $createInput -eq "Y") {
            New-Item -ItemType Directory -Path $InputDirResolved -Force | Out-Null
            Write-Host "  [OK] Created input directory." -ForegroundColor Green
        } else {
            Write-Host "  Exiting. No files to process." -ForegroundColor Red
            exit 0
        }
    }
}

# -- Collect JPG/JPEG files from input
$jpgFiles = @()
if (Test-Path -LiteralPath $InputDirResolved -PathType Container) {
    $jpgFiles = Get-ChildItem -LiteralPath $InputDirResolved -Include "*.jpg", "*.jpeg" -File
}

if ($jpgFiles.Count -eq 0) {
    Write-Host "  [WARN] No JPG/JPEG files found in input directory." -ForegroundColor Yellow
    Write-Host "         $InputDirResolved" -ForegroundColor Yellow
    Write-Host "  Place your Canva AI exports there and re-run." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "  Found $($jpgFiles.Count) JPG file(s) to process." -ForegroundColor Cyan
Write-Host ""

# -- Create output directory if needed
if (-not (Test-Path -LiteralPath $OutputDirResolved -PathType Container)) {
    if ($DryRun) {
        Write-Host "  [DRY-RUN] Would create output directory: $OutputDirResolved" -ForegroundColor DarkYellow
    } else {
        New-Item -ItemType Directory -Path $OutputDirResolved -Force | Out-Null
        Write-Host "  [OK] Created output directory." -ForegroundColor Green
    }
}

# -- Process each file
$successCount = 0
$failCount    = 0
$skipCount    = 0

foreach ($file in $jpgFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outputFile = Join-Path $OutputDirResolved "$baseName.png"
    $inputPath  = $file.FullName
    $relativeInput  = "assets/canva/raw/$($file.Name)"
    $relativeOutput = "assets/images/$baseName.png"

    Write-Host "  -- $($file.Name) --" -ForegroundColor White

    # Determine asset type by filename prefix
    $typeInfo = Get-AssetTypeInfo -FileName $file.Name

    if ($null -eq $typeInfo) {
        Write-Host "        !! Unknown asset type (no matching prefix). Skipping." -ForegroundColor DarkYellow
        Write-Host "        Expected prefixes: $($AssetTypes.Keys -join ', ')" -ForegroundColor DarkGray
        $skipCount++
        continue
    }

    # Describe what we'll do
    if ($typeInfo.Width -eq -1 -or $typeInfo.Height -eq -1) {
        $sizeDesc = "original size"
    } else {
        $sizeDesc = "$($typeInfo.Width)x$($typeInfo.Height)"
    }
    if ($typeInfo.Transparent) {
        $transDesc = "transparent"
    } else {
        $transDesc = "opaque"
    }

    Write-Host "        Type: $($typeInfo.Description)" -ForegroundColor DarkGray
    Write-Host "        Action: ${sizeDesc}, ${transDesc}" -ForegroundColor DarkGray
    Write-Host "        Output: $relativeOutput" -ForegroundColor DarkGray

    # Check if output already exists
    $outputExists = Test-Path -LiteralPath $outputFile -PathType Leaf

    if ($outputExists -and -not $Force) {
        Write-Host "        Skip (PNG exists, use -Force to overwrite)" -ForegroundColor DarkYellow
        $skipCount++
        continue
    }

    if ($DryRun) {
        if ($outputExists) {
            Write-Host "        [DRY-RUN] Would reprocess (overwrite existing)" -ForegroundColor DarkYellow
        } else {
            Write-Host "        [DRY-RUN] Would process -> $relativeOutput" -ForegroundColor DarkYellow
        }
        if ($Verbose) {
            if ($typeInfo.Transparent) {
                Write-Host "        Would chroma-key: #${KeyColor}, resize to $($typeInfo.Width)x$($typeInfo.Height)" -ForegroundColor DarkGray
            } else {
                Write-Host "        Would convert JPG->PNG, resize to $($typeInfo.Width)x$($typeInfo.Height)" -ForegroundColor DarkGray
            }
        }
        $skipCount++
        continue
    }

    # -- Execute conversion
    try {
        $exitCode = Convert-Asset `
            -InputPath $inputPath `
            -OutputPath $outputFile `
            -TypeInfo $typeInfo `
            -KeyColorArg $KeyColor `
            -IsVerbose $Verbose

        if ($exitCode -eq 0) {
            # Verify output file was created
            if (Test-Path -LiteralPath $outputFile -PathType Leaf) {
                $outFileInfo = Get-Item -LiteralPath $outputFile
                $sizeKB = [math]::Round($outFileInfo.Length / 1KB, 1)
                Write-Host "        OK - ${sizeKB}KB written" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "        WARNING: ffmpeg reported success but output file missing" -ForegroundColor Yellow
                $failCount++
            }
        } else {
            Write-Host "        FAILED: ffmpeg exited with code $exitCode" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "        EXCEPTION: $_" -ForegroundColor Red
        $failCount++
    }

    Write-Host ""
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "  DRY RUN - no files were actually converted." -ForegroundColor DarkYellow
    Write-Host "  Remove the -DryRun switch to execute conversion." -ForegroundColor DarkYellow
    Write-Host ""
}

Write-KeyValue "Files found" "$($jpgFiles.Count)"
Write-KeyValue "Successfully converted" "$successCount" "Green"
if ($failCount -gt 0) {
    Write-KeyValue "Failed" "$failCount" "Red"
} else {
    Write-KeyValue "Failed" "$failCount" "Green"
}
if ($skipCount -gt 0) {
    Write-KeyValue "Skipped" "$skipCount" "Yellow"
} else {
    Write-KeyValue "Skipped" "$skipCount" "Green"
}
Write-KeyValue "Total attempted" "$($successCount + $failCount)"

Write-Host ""

if ($successCount -gt 0) {
    Write-Host "  Output directory: $OutputDirResolved" -ForegroundColor Cyan
    Write-Host "  Assets ready for use in game." -ForegroundColor Cyan
}

Write-Host ""
