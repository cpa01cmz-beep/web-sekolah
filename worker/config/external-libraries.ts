export const SwaggerUIConfig = {
  VERSION: '5.18.2',
  CDN_BASE_URL: 'https://unpkg.com',
  get PACKAGE_PATH() {
    return `swagger-ui-dist@${this.VERSION}`;
  },
  get CSS_URL() {
    return `${this.CDN_BASE_URL}/${this.PACKAGE_PATH}/swagger-ui.css`;
  },
  get BUNDLE_URL() {
    return `${this.CDN_BASE_URL}/${this.PACKAGE_PATH}/swagger-ui-bundle.js`;
  },
  get PRESET_URL() {
    return `${this.CDN_BASE_URL}/${this.PACKAGE_PATH}/swagger-ui-standalone-preset.js`;
  },
  INTEGRITY: {
    CSS: 'sha384-rcbEi6xgdPk0iWkAQzT2F3FeBJXdG+ydrawGlfHAFIZG7wU6aKbQaRewysYpmrlW',
    BUNDLE: 'sha384-NXtFPpN61oWCuN4D42K6Zd5Rt2+uxeIT36R7kpXBuY9tLnZorzrJ4ykpqwJfgjpZ',
    PRESET: 'sha384-qr68CD0cvHa88PmVu7e1a58Ego4qvKtcvcLdS2a8Mo5zILI01gyIV9jVwJk7X2NU',
  },
} as const;
