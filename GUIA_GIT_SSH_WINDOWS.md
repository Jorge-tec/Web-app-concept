# 🚀 Guía Definitiva: Configurar Git y SSH en Windows para GitHub

Esta guía te explica paso a paso cómo configurar **Git** en **Windows** utilizando claves de seguridad **SSH** para enviar y clonar tus proyectos sin tener que escribir contraseñas ni lidiar con tokens expirados.

---

## 📑 Tabla de Contenidos
1. [Requisitos Previos](#1-requisitos-previos)
2. [Paso 1: Configurar Nombre y Correo en Git](#paso-1-configurar-nombre-y-correo-en-git)
3. [Paso 2: Generar tu Clave SSH (Ed25519)](#paso-2-generar-tu-clave-ssh-ed25519)
4. [Paso 3: Copiar tu Clave Pública](#paso-3-copiar-tu-clave-pública)
5. [Paso 4: Añadir la Clave SSH a GitHub](#paso-4-añadir-la-clave-ssh-a-github)
6. [Paso 5: Probar la Conexión con GitHub](#paso-5-probar-la-conexión-con-github)
7. [Paso 6: Conectar tu Proyecto Local y Enviar a GitHub](#paso-6-conectar-tu-proyecto-local-y-enviar-a-github)
8. [Flujo Diario de Trabajo](#flujo-diario-de-trabajo)
9. [Solución a Problemas Comunes](#solución-a-problemas-comunes)

---

## 1. Requisitos Previos
- Tener instalado **Git para Windows** ([Descargar de git-scm.com](https://git-scm.com/)).
- Tener una cuenta activa en [GitHub.com](https://github.com).
- Usar **PowerShell** o **Git Bash** en Windows.

---

## Paso 1: Configurar Nombre y Correo en Git

Abre **PowerShell** o **Git Bash** y define tu identidad global (usa el mismo correo de tu cuenta de GitHub):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu_correo@ejemplo.com"
```

Para verificar que quedaron guardados correctamente:
```bash
git config --get user.name
git config --get user.email
```

---

## Paso 2: Generar tu Clave SSH (Ed25519)

El algoritmo **Ed25519** es el estándar moderno, más seguro y rápido recomendado por GitHub.

Ejecuta el siguiente comando (sustituye por tu correo de GitHub):

```bash
ssh-keygen -t ed25519 -C "tu_correo@ejemplo.com"
```

El sistema te hará tres preguntas en la consola:

1. **`Enter file in which to save the key (C:\Users\TuUsuario/.ssh/id_ed25519):`**
   > [!IMPORTANT]
   > **Presiona solo `ENTER`**. No escribas ningún nombre manual. Al presionar Enter tomará el nombre por defecto `id_ed25519`, el cual Git y Windows reconocen automáticamente sin configuraciones extra.

2. **`Enter passphrase (empty for no passphrase):`**
   > Presiona **`ENTER`** si no deseas ponerle contraseña extra cada vez que hagas push.

3. **`Enter same passphrase again:`**
   > Vuelve a presionar **`ENTER`**.

Se generarán dos archivos en la carpeta `C:\Users\TuUsuario\.ssh\`:
- `id_ed25519`: **Clave privada** (¡NUNCA la compartas ni la envíes a nadie!).
- `id_ed25519.pub`: **Clave pública** (esta es la que se sube a GitHub).

---

## Paso 3: Copiar tu Clave Pública

Para copiar la clave pública directamente a tu portapapeles de Windows sin errores de selección:

### En PowerShell:
```powershell
Get-Content $HOME\.ssh\id_ed25519.pub | Set-Clipboard
```

*(Opcional: Si quieres verla en pantalla para confirmar):*
```powershell
type $HOME\.ssh\id_ed25519.pub
```
*Debe iniciar con `ssh-ed25519 AAAAC3...` y terminar con tu correo electrónico.*

---

## Paso 4: Añadir la Clave SSH a GitHub

1. Inicia sesión en [GitHub.com](https://github.com).
2. En la esquina superior derecha, haz clic en tu foto de perfil y selecciona **Settings** (Configuración).
3. En el menú lateral izquierdo, haz clic en **SSH and GPG keys** (o ve directo a [github.com/settings/keys](https://github.com/settings/keys)).
4. Haz clic en el botón verde **New SSH key**.
5. Completa los campos:
   - **Title:** Pon un nombre representativo, por ejemplo: `Mi Laptop Windows` o `PC Casa`.
   - **Key type:** Déjalo en `Authentication Key`.
   - **Key:** Haz clic derecho y **Pega** el texto copiado en el Paso 3.
6. Haz clic en **Add SSH key** (puede que GitHub te pida confirmar tu contraseña o 2FA).

---

## Paso 5: Probar la Conexión con GitHub

Regresa a tu terminal y ejecuta:

```bash
ssh -T git@github.com
```

- Si te pregunta: `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
  Escribe **`yes`** y presiona **Enter**.

- Debe responderte con este mensaje de éxito:
  > **`Hi TuUsuario! You've successfully authenticated, but GitHub does not provide shell access.`**

*(¡Felicidades! Tu máquina ya está autenticada con GitHub por SSH).*

---

## Paso 6: Conectar tu Proyecto Local y Enviar a GitHub

### Caso A: Si ya tienes un proyecto existente en tu computadora

Abre la terminal en la carpeta de tu proyecto (por ejemplo `d:\dev\mi-proyecto`):

```bash
# 1. Inicializar git si no lo habías hecho
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer el primer commit
git commit -m "Primer commit del proyecto"

# 4. Asignar el enlace SSH de tu repositorio en GitHub
git remote add origin git@github.com:TuUsuario/Nombre-Del-Repo.git

# 5. Si ya tenías un remoto por HTTPS y quieres cambiarlo a SSH:
git remote set-url origin git@github.com:TuUsuario/Nombre-Del-Repo.git

# 6. Enviar a GitHub configurando la rama principal (master o main)
git push -u origin master
```

### Caso B: Si vas a clonar un repositorio existente desde GitHub
Copia la URL **SSH** (comienza con `git@github.com:`):
```bash
git clone git@github.com:TuUsuario/Nombre-Del-Repo.git
```

---

## Flujo Diario de Trabajo

Cada vez que realices cambios o avances en tu código, solo necesitas estos 3 pasos:

```bash
# 1. Preparar todos los cambios modificados o nuevos
git add .

# 2. Guardar el punto de control con una descripción clara
git commit -m "Se agregan nuevas funcionalidades"

# 3. Subir los cambios a GitHub
git push
```

Para ver el estado actual en cualquier momento:
```bash
git status
```

Para descargar cambios nuevos que estén en GitHub:
```bash
git pull
```

---

## Solución a Problemas Comunes

### 1. `Permission denied (publickey)`
- **Causa común:** Le pusiste un nombre personalizado al archivo de clave (ej. `mi_clave`) y Git no sabe cuál usar.
- **Solución:** Crea el archivo `config` dentro de `C:\Users\TuUsuario\.ssh\config` con el siguiente contenido:
  ```text
  Host github.com
      HostName github.com
      User git
      IdentityFile ~/.ssh/tu_nombre_de_clave
      IdentitiesOnly yes
  ```
  O simplemente renombra tus archivos a `id_ed25519` y `id_ed25519.pub`.

### 2. El repositorio tiene rama `main` en lugar de `master`
Si tu repositorio en GitHub usa la rama por defecto `main`:
```bash
git branch -M main
git push -u origin main
```

### 3. Verificar qué URL remota está usando tu proyecto
```bash
git remote -v
```
- Si empieza con `https://github.com/...`, usa contraseña o token.
- Si empieza con `git@github.com:...`, está usando tu clave **SSH**.
