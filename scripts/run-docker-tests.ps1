# ============================================================
# Pyvot QA Assignment - Docker Test Runner
#
# Purpose:
#   Run the same Playwright Docker image against either
#   CLEAN or BUGGY Toolshop environments.
#
# Usage:
#   ./scripts/run-docker-tests.ps1 clean
#   ./scripts/run-docker-tests.ps1 buggy
# ============================================================

param(
    # Only CLEAN or BUGGY values are accepted.
    [Parameter(Mandatory = $true)]
    [ValidateSet("clean", "buggy")]
    [string]$Environment
)

# ------------------------------------------------------------
# Resolve environment configuration
# ------------------------------------------------------------

if ($Environment.ToLower() -eq "buggy") {

    $testEnvironment = "BUGGY"
    $uiBaseUrl = "https://with-bugs.practicesoftwaretesting.com"
    $apiBaseUrl = "https://api-with-bugs.practicesoftwaretesting.com"

}
else {

    $testEnvironment = "CLEAN"
    $uiBaseUrl = "https://practicesoftwaretesting.com"
    $apiBaseUrl = "https://api.practicesoftwaretesting.com"
}

# ------------------------------------------------------------
# Display execution configuration
# ------------------------------------------------------------

Write-Host "=========================================="
Write-Host "Pyvot Playwright Docker Regression"
Write-Host "=========================================="
Write-Host "Environment : $testEnvironment"
Write-Host "UI Base URL : $uiBaseUrl"
Write-Host "API Base URL: $apiBaseUrl"
Write-Host "Browser     : Playwright Chromium"
Write-Host "Docker Image: pyvot-playwright"
Write-Host "=========================================="

# ------------------------------------------------------------
# Run Playwright Docker container
# ------------------------------------------------------------

docker run --rm `
    -e "TEST_ENVIRONMENT=$testEnvironment" `
    -e "UI_BASE_URL=$uiBaseUrl" `
    -e "API_BASE_URL=$apiBaseUrl" `
    pyvot-playwright

# Capture Docker/Playwright exit code.
$exitCode = $LASTEXITCODE

# Return the same exit code to the caller / npm / CI.
exit $exitCode