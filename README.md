# Aura Wallet

Una Progressive Web App (PWA) moderna y segura para gestionar cuentas criptográficas en redes basadas en Substrate/Polkadot, con capacidades avanzadas de seguridad, privacidad y gestión de identidad.

## 🚀 Características Principales

### 🔐 Seguridad y Autenticación
- **WebAuthn** - Autenticación biométrica y con hardware keys (Windows Hello, Touch ID, YubiKey)
- **Encriptación AES-GCM-256** - Protección de claves privadas con contraseña
- **Keyring no custodial** - Tus claves privadas nunca salen de tu dispositivo
- **Firma digital** - Soporte para sr25519, ed25519 y ecdsa

### 💼 Gestión de Cuentas
- **Múltiples cuentas** - Gestiona múltiples cuentas desde un solo wallet
- **Importación flexible** - Importa cuentas desde mnemonic, URI o archivos JSON
- **Backup completo** - Exporta e importa todos tus datos (cuentas, contactos, configuraciones)
- **Identicons** - Visualización de cuentas con Polkadot Identicons

### 🌐 Multi-Cadena
- **Soporte multi-cadena** - Conecta a múltiples redes Substrate simultáneamente
- **Redes preconfiguradas** - Polkadot, Kusama, Paseo y sus parachains
- **Balance multi-cadena** - Consulta balances en todas tus cuentas conectadas
- **People Chain Integration** - Consulta identidades on-chain desde People Chain

### 📱 Experiencia de Usuario
- **Mobile-first** - Diseño optimizado para dispositivos móviles
- **Offline-first** - Funciona completamente sin conexión
- **Instalable** - Instala como app nativa en tu dispositivo
- **UI intuitiva** - Menos de 3 clicks para cualquier acción

### 🔒 Privacidad e Identidad
- **Página de Identidad** - Gestiona tu identidad on-chain y privacidad
- **Contactos** - Guarda direcciones de contactos frecuentes
- **Configuración de APIs** - Conecta con servicios externos de atestación

## 📦 Instalación

Este proyecto usa **Yarn** como gestor de paquetes. Asegúrate de tener Yarn instalado:

```bash
# Instalar Yarn globalmente (si no lo tienes)
npm install -g yarn

# Instalar dependencias
yarn install
```

## 🛠️ Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn dev

# El servidor estará disponible en:
# - Local: http://localhost:5173/
# - Red: http://[tu-ip]:5173/
```

## 🏗️ Build

```bash
# Construir para producción
yarn build

# Vista previa de la build de producción
yarn preview
```

## 🌐 Redes Soportadas

### Redes Principales
- **Polkadot** (wss://rpc.polkadot.io)
- **Kusama** (wss://kusama-rpc.polkadot.io)
- **Paseo Relay Chain** (wss://rpc.ibp.network/paseo) - Testnet de Polkadot

### Parachains de Polkadot
- Asset Hub (Polkadot) (wss://polkadot-asset-hub-rpc.polkadot.io)
- People Chain (Polkadot) (wss://polkadot-people-rpc.polkadot.io)

### Parachains de Kusama
- Asset Hub (Kusama) (wss://kusama-asset-hub-rpc.polkadot.io)
- People Chain (Kusama) (wss://kusama-people-rpc.polkadot.io)

### Parachains de Paseo
- Asset Hub (Paseo) (wss://sys.ibp.network/asset-hub-paseo)
- Bridge Hub (Paseo) (wss://sys.ibp.network/bridgehub-paseo)
- Coretime (Paseo) (wss://sys.ibp.network/coretime-paseo)
- People (Paseo) (wss://sys.ibp.network/people-paseo)
- Collectives (Paseo) (wss://collectives-paseo.dotters.network)

## 🎯 Funcionalidades

### Gestión de Cuentas
- Crear nuevas cuentas con mnemonic de 12 o 24 palabras
- Importar cuentas desde mnemonic, URI o archivo JSON
- Gestionar múltiples cuentas simultáneamente
- Ver balances en múltiples cadenas
- Enviar transacciones

### Seguridad
- **WebAuthn** - Autenticación con PIN, huella dactilar o hardware key
- **Encriptación** - Todas las cuentas se almacenan encriptadas localmente
- **Backup seguro** - Exporta tus datos encriptados con contraseña
- **Recuperación** - Restaura tu wallet desde un backup

### Privacidad
- **Identidad On-Chain** - Consulta y gestiona tu identidad en People Chain
- **Contactos** - Guarda direcciones de contactos frecuentes
- **Configuración de APIs** - Conecta con servicios externos de forma segura

### Transacciones
- Enviar tokens a otras direcciones
- Recibir tokens (mostrar QR code)
- Ver historial de transacciones
- Estimar fees antes de enviar

## 🔑 Tipos de Criptografía Soportados

- **sr25519** (Schnorrkel) - Recomendado para Substrate
- **ed25519** (Edwards) - Alternativa común
- **ecdsa** - Compatible con Ethereum (usado en Moonbeam)

## 📚 Documentación

La documentación completa del proyecto está disponible en la carpeta `docs/`:

- **[API Design](./docs/API_DESIGN.md)** - Diseño de la API para servicios externos
- **[Database Structure](./docs/AURA_WALLET_DATABASE.md)** - Estructura de IndexedDB
- **[UI Structure](./docs/AURA_WALLET_UI_STRUCTURE.md)** - Estructura de páginas y componentes
- **[WebAuthn Implementation](./docs/WEBAUTHN_IMPLEMENTATION.md)** - Implementación de WebAuthn
- **[Keyring Flow](./docs/KEYRING_FLOW.md)** - Flujo de gestión del keyring
- **[PWA Offline Capabilities](./docs/PWA_OFFLINE_CAPABILITIES.md)** - Capacidades offline

## 🛡️ Seguridad

### ⚠️ Advertencia Importante

Aura Wallet es una aplicación **no custodial**. Esto significa:

- **Tú eres el único responsable** de tus claves privadas y fondos
- **Guarda tu frase de recuperación** en un lugar seguro
- **Nunca compartas** tu frase de recuperación con nadie
- **Si pierdes tu frase de recuperación**, perderás acceso permanente a tus fondos
- **No hay forma de recuperar** tu cuenta sin la frase de recuperación

### Mejores Prácticas

1. **Backup regular** - Exporta tu wallet regularmente
2. **Contraseña segura** - Usa una contraseña fuerte y única
3. **WebAuthn** - Configura WebAuthn para autenticación adicional
4. **Verifica direcciones** - Siempre verifica las direcciones antes de enviar
5. **Mantén actualizado** - Mantén la aplicación actualizada

## 🏗️ Stack Tecnológico

- **Vite 7** - Build tool ultra rápido
- **React 18** - Framework UI
- **TypeScript** - Tipado estático completo
- **Tailwind CSS 4** - Framework CSS moderno
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Dedot** - Cliente JavaScript de próxima generación para Polkadot
- **Polkadot.js Keyring** - Gestión de cuentas criptográficas
- **IndexedDB** - Almacenamiento local encriptado
- **WebAuthn API** - Autenticación biométrica y con hardware keys
- **Workbox** - Service Worker para capacidades offline

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para cualquier mejora o corrección.

## 📧 Contacto

Para preguntas o soporte, por favor abre un issue en el repositorio.
