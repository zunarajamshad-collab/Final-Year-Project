# PowerShell-based Web Server for Learnify
# Runs locally on http://localhost:3000/ without Node.js or Python dependencies!

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Could not start the server on port 3000." -ForegroundColor Red
    Write-Host "Make sure port 3000 is not already in use by another application." -ForegroundColor Red
    Write-Host "Details: $_" -ForegroundColor Red
    Exit
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  LEARNIFY: SMART LEARNING SYSTEM RUNNING" -ForegroundColor Green
Write-Host "  Local URL: http://localhost:3000" -ForegroundColor Green
Write-Host "  Press Ctrl+C in this terminal to stop the server" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $urlPath = $request.Url.LocalPath
            
            # Determine file path based on clean URL routes
            $filePath = ""
            if ($urlPath -eq "/") {
                $filePath = Join-Path $PSScriptRoot "public\index.html"
            } elseif ($urlPath -eq "/login/student") {
                $filePath = Join-Path $PSScriptRoot "public\login-student.html"
            } elseif ($urlPath -eq "/login/teacher") {
                $filePath = Join-Path $PSScriptRoot "public\login-teacher.html"
            } elseif ($urlPath -eq "/admin") {
                $filePath = Join-Path $PSScriptRoot "public\login-admin.html"
            } elseif ($urlPath -eq "/admin/dashboard") {
                $filePath = Join-Path $PSScriptRoot "public\admin\dashboard.html"
            } elseif ($urlPath -eq "/admin/subjects") {
                $filePath = Join-Path $PSScriptRoot "public\admin\subjects.html"
            } elseif ($urlPath -eq "/admin/teachers") {
                $filePath = Join-Path $PSScriptRoot "public\admin\teachers.html"
            } elseif ($urlPath -eq "/admin/content") {
                $filePath = Join-Path $PSScriptRoot "public\admin\content.html"
            } elseif ($urlPath -eq "/admin/quizzes") {
                $filePath = Join-Path $PSScriptRoot "public\admin\quizzes.html"
            } elseif ($urlPath -eq "/admin/fill-in-blanks") {
                $filePath = Join-Path $PSScriptRoot "public\admin\fill-in-blanks.html"
            } elseif ($urlPath -eq "/admin/grading") {
                $filePath = Join-Path $PSScriptRoot "public\admin\grading.html"
            } elseif ($urlPath -eq "/teacher/dashboard") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\dashboard.html"
            } elseif ($urlPath -eq "/teacher/subjects") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\subjects.html"
            } elseif ($urlPath -eq "/teacher/content") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\content.html"
            } elseif ($urlPath -eq "/teacher/quizzes") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\quizzes.html"
            } elseif ($urlPath -eq "/teacher/fill-in-blanks") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\fill-in-blanks.html"
            } elseif ($urlPath -eq "/teacher/grading") {
                $filePath = Join-Path $PSScriptRoot "public\teacher\grading.html"
            } elseif ($urlPath -eq "/student/dashboard") {
                $filePath = Join-Path $PSScriptRoot "public\student\dashboard.html"
            } elseif ($urlPath -eq "/student/subjects") {
                $filePath = Join-Path $PSScriptRoot "public\student\subjects.html"
            } elseif ($urlPath -eq "/student/quizzes") {
                $filePath = Join-Path $PSScriptRoot "public\student\quizzes.html"
            } elseif ($urlPath -eq "/student/fill-in-blanks") {
                $filePath = Join-Path $PSScriptRoot "public\student\fill-in-blanks.html"
            } elseif ($urlPath -eq "/student/content") {
                $filePath = Join-Path $PSScriptRoot "public\student\content.html"
            } else {
                # Static asset mapping
                $relativePath = $urlPath.TrimStart('/')
                $relativePath = $relativePath -replace '/', '\'
                $filePath = Join-Path $PSScriptRoot "public\$relativePath"
            }

            if (Test-Path $filePath -PathType Leaf) {
                # Determine content type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/html; charset=utf-8"
                if ($ext -eq ".css") { $contentType = "text/css" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }

                $response.ContentType = $contentType
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - 200 - $($request.HttpMethod) $($urlPath)" -ForegroundColor Gray
            } else {
                # Fallback to index.html if file doesn't exist
                $fallbackPath = Join-Path $PSScriptRoot "public\index.html"
                if (Test-Path $fallbackPath -PathType Leaf) {
                    $response.ContentType = "text/html; charset=utf-8"
                    $bytes = [System.IO.File]::ReadAllBytes($fallbackPath)
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') - 200 (Fallback) - $($request.HttpMethod) $($urlPath)" -ForegroundColor DarkYellow
                } else {
                    $response.StatusCode = 404
                    $response.StatusDescription = "Not Found"
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') - 404 - $($request.HttpMethod) $($urlPath)" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Connection Error: $_" -ForegroundColor Yellow
        } finally {
            try {
                $response.Close()
            } catch {}
        }
    }
} finally {
    $listener.Stop()
    Write-Host "`nServer stopped." -ForegroundColor Red
}
