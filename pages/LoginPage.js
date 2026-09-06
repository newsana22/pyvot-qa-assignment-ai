// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/** Login page (`/auth/login`). Confirmed selectors: docs/ai-knowledge/ui-reference.md — Auth — Login. */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}

module.exports = { LoginPage };
