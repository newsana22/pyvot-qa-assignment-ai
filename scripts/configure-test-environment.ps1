# ============================================================
# Pyvot QA Assignment - Test Environment Configuration
#
# Purpose:
#   Select CLEAN or BUGGY Toolshop environment URLs.
#
# Used by:
#   - GitHub Actions
#   - Self-hosted GitHub Actions
#   - Docker helper scripts
# ============================================================

param(
    # Environment accepted by the script: clean or buggy.
    [Parameter(Mandatory = $true)]
    [ValidateSet("clean", "buggy")]
    [string]$Environment
)

# Normalize the supplied value to lowercase.
$targetEnvironment = $Environment.ToLower()

if ($targetEnvironment -eq "buggy") {

    # BUGGY environment values.
    $testEnvironment = "BUGGY"
    $uiBaseUrl = "https://with-bugs.practicesoftwaretesting.com"
    $apiBaseUrl = "https://api-with-bugs.practicesoftwaretesting.com"

}
else {

    # CLEAN environment values.
    $testEnvironment = "CLEAN"
    $uiBaseUrl = "https://practicesoftwaretesting.com"
    $apiBaseUrl = "https://api.practicesoftwaretesting.com"
}

# Set variables for the current PowerShell process.
$env:TEST_ENVIRONMENT = $testEnvironment
$env:UI_BASE_URL = $uiBaseUrl
$env:API_BASE_URL = $apiBaseUrl

# If the script is running inside GitHub Actions,
# also persist the variables for the later workflow steps.
if ($env:GITHUB_ENV) {

    "TEST_ENVIRONMENT=$testEnvironment" |
        Out-File -FilePath $env:GITHUB_ENV -Append -Encoding utf8

    "UI_BASE_URL=$uiBaseUrl" |
        Out-File -FilePath $env:GITHUB_ENV -Append -Encoding utf8

    "API_BASE_URL=$apiBaseUrl" |
        Out-File -FilePath $env:GITHUB_ENV -Append -Encoding utf8
}

# Display the selected environment for execution evidence.
Write-Host "=========================================="
Write-Host "Pyvot Test Environment Configuration"
Write-Host "=========================================="
Write-Host "Environment : $testEnvironment"
Write-Host "UI Base URL : $uiBaseUrl"
Write-Host "API Base URL: $apiBaseUrl"
Write-Host "=========================================="