# Simple ICO Creator for Smart Attendance System
Add-Type -AssemblyName System.Drawing

# Create a 32x32 bitmap for favicon
$bitmap = New-Object System.Drawing.Bitmap(32, 32)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Set high quality rendering
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Create brushes and pens
$backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(32, 32)),
    [System.Drawing.Color]::FromArgb(118, 75, 162),  # #764ba2
    [System.Drawing.Color]::FromArgb(102, 126, 234)  # #667eea
)

$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 68, 68))
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 1)

# Fill background with gradient
$graphics.FillEllipse($backgroundBrush, 0, 0, 32, 32)

# Draw radar rings
$whitePen.Color = [System.Drawing.Color]::FromArgb(100, 255, 255, 255)  # Semi-transparent white
$graphics.DrawEllipse($whitePen, 4, 4, 24, 24)
$graphics.DrawEllipse($whitePen, 8, 8, 16, 16)
$graphics.DrawEllipse($whitePen, 12, 12, 8, 8)

# Draw GPS pin
# Pin body (circle)
$graphics.FillEllipse($redBrush, 10, 8, 12, 12)

# Pin point (triangle)
$pinPoints = @(
    (New-Object System.Drawing.Point(14, 20)),
    (New-Object System.Drawing.Point(16, 24)),
    (New-Object System.Drawing.Point(18, 20))
)
$graphics.FillPolygon($redBrush, $pinPoints)

# Pin inner circle
$graphics.FillEllipse($whiteBrush, 13, 11, 6, 6)

# Pin center dot
$graphics.FillEllipse($redBrush, 15, 13, 2, 2)

# Save as ICO
$iconPath = "favicon-new.ico"
$memoryStream = New-Object System.IO.MemoryStream

# Convert to ICO format (simplified)
$bitmap.Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $memoryStream.ToArray()

# Create ICO header (6 bytes) + directory entry (16 bytes) + PNG data
$icoHeader = @(0, 0, 1, 0, 1, 0)  # ICO signature + 1 image
$dirEntry = @(32, 32, 0, 0, 1, 0, 32, 0) + [BitConverter]::GetBytes($pngBytes.Length) + [BitConverter]::GetBytes(22)

$icoBytes = $icoHeader + $dirEntry + $pngBytes
[System.IO.File]::WriteAllBytes($iconPath, $icoBytes)

Write-Host "Created $iconPath successfully!"
Write-Host "File size: $((Get-Item $iconPath).Length) bytes"

# Cleanup
$graphics.Dispose()
$bitmap.Dispose()
$backgroundBrush.Dispose()
$redBrush.Dispose()
$whiteBrush.Dispose()
$whitePen.Dispose()
$memoryStream.Dispose()
