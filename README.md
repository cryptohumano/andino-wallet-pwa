# PWA Substrate Explorer

Una Progressive Web App (PWA) moderna para explorar las capacidades de [Dedot](https://docs.dedot.dev/) y redes basadas en Polkadot SDK.

## 🚀 Características

- **Vite 7** - Build tool ultra rápido
- **Tailwind CSS 4** - Framework CSS moderno
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Dedot** - Cliente JavaScript de próxima generación para Polkadot
- **PWA** - Instalable y funciona offline
- **TypeScript** - Tipado estático completo

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
yarn dev
```

## 🏗️ Build

```bash
yarn build
```

## 🌐 Redes Soportadas

- Polkadot (wss://rpc.polkadot.io)
- Kusama (wss://kusama-rpc.polkadot.io)
- Paseo Relay Chain (wss://rpc.ibp.network/paseo) - Testnet de Polkadot
- Asset Hub (Paseo) (wss://sys.ibp.network/asset-hub-paseo)
- Bridge Hub (Paseo) (wss://sys.ibp.network/bridgehub-paseo)
- Coretime (Paseo) (wss://sys.ibp.network/coretime-paseo)
- People (Paseo) (wss://sys.ibp.network/people-paseo)
- Collectives (Paseo) (wss://collectives-paseo.dotters.network)
- Asset Hub (Polkadot) (wss://polkadot-asset-hub-rpc.polkadot.io)
- Asset Hub (Kusama) (wss://kusama-asset-hub-rpc.polkadot.io)
- People Chain (Polkadot) (wss://polkadot-people-rpc.polkadot.io)
- People Chain (Kusama) (wss://kusama-people-rpc.polkadot.io)

## 🎯 Funcionalidades

### Conexión a Redes
Conecta a múltiples redes de Polkadot usando WebSocket providers.

### Información de Cadena
- Nombre de la cadena
- Versión del runtime
- Genesis hash
- Propiedades de la cadena
- Metadata

### Exploración de Bloques
- Consulta bloques por número
- Visualiza extrinsics
- Headers de bloques
- Hash de bloques

### Información de Cuentas
- Balance de cuentas
- Nonce
- Datos de cuenta

### Gestión de Keyring (@polkadot/keyring)
- Generar mnemonics (12, 15, 18, 21 o 24 palabras)
- Crear cuentas desde mnemonic
- Crear cuentas desde Substrate URI (ej: //Alice, //Bob)
- Soporte para múltiples tipos de criptografía (sr25519, ed25519, ecdsa)
- Gestión de múltiples cuentas
- Formato SS58 configurable (Polkadot, Kusama, Substrate Generic, etc.)

### Firma y Verificación
- Firmar mensajes con cuentas del keyring
- Verificar firmas de mensajes
- Soporte para diferentes tipos de criptografía

## 📚 Recursos

- [Documentación de Dedot](https://docs.dedot.dev/)
- [Polkadot.js Keyring Documentation](https://polkadot.js.org/docs/keyring/start/)
- [Polkadot Wiki](https://wiki.polkadot.network/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🔑 Funcionalidades de Keyring

Este proyecto integra `@polkadot/keyring` para proporcionar funcionalidades completas de gestión de cuentas:

### Tipos de Criptografía Soportados
- **sr25519** (Schnorrkel) - Recomendado para Substrate
- **ed25519** (Edwards) - Alternativa común
- **ecdsa** - Compatible con Ethereum (usado en Moonbeam)

### Cuentas de Desarrollo
En redes de desarrollo, puedes usar cuentas pre-fundadas:
- `//Alice`
- `//Bob`
- `//Charlie`
- `//Dave`
- `//Eve`
- `//Ferdie`

### Formatos SS58
El proyecto soporta múltiples formatos SS58 para diferentes redes:
- **0** - Polkadot
- **2** - Kusama
- **42** - Substrate Generic (por defecto)
- Y muchos más según el [ss58-registry](https://github.com/paritytech/ss58-registry)

## 📝 Licencia

MIT

