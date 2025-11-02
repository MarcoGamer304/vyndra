# VyndraJS

**VyndraJS** es un **micro-framework para Node.js y TypeScript** que combina **routing**, **ORM**, **inyección automática de dependencias (DI)** y **decoradores modernos**.
Está diseñado para crear **APIs, microservicios y arquitecturas modulares** de manera rápida, limpia y escalable.

VyndraJS busca ofrecer una **estructura de código coherente, predecible y moderna**, con soporte nativo para **autoimportación de componentes**, **publicación de eventos con RabbitMQ** y un **CLI oficial** para automatizar tareas comunes.

---

## Instalación

```bash
npm install vyndra-js
npm install -g vyndra-js
```

---

## Estructura recomendada

```
src/
 ├─ controllers/
 │   └─ user.controller.ts
 ├─ services/
 │   └─ user.service.ts
 ├─ repositories/
 │   └─ user.repository.ts
 ├─ models/
 │   └─ user.model.ts
 ├─ listeners/
 │   └─ auth.listener.ts
 └─ main.ts
```

> VyndraJS **autoimporta** automáticamente todos los archivos con sufijos `.controller.js` y `.service.ts` al iniciar la aplicación.

---

## Requisitos y consideraciones

### Requisitos básicos

Antes de usar VyndraJS, asegúrate de tener:

- **Node.js 18 o superior**
- **TypeScript** instalado global o localmente

  ```bash
  npm install -D typescript ts-node
  ```
- Archivo `tsconfig.json` configurado con decoradores habilitados:

  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "NodeNext",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    }
  }
  ```

---

### Requisitos opcionales: RabbitMQ

VyndraJS ofrece integración nativa con **RabbitMQ** para manejar **eventos asíncronos** mediante decoradores como `@Publish()` y `@QueueListenerMethod()`.

Puedes habilitar RabbitMQ de dos maneras:

#### 1. Usando variables de entorno:

```bash
MESSAGE_BROKER_PORT=5672
MESSAGE_BROKER_HOST=amqps://user:pass@bunny.cloudamqp.com/vhost
MESSAGE_BROKER_TIMEOUT=15000
MESSAGE_BROKER_AMQP=5672
MESSAGE_BROKER_MANAGEMENT=15672
MESSAGE_BROKER_IMAGE=rabbitmq:3-management
```

#### 2. O dejando que VyndraJS cree un contenedor automáticamente:

```ts
const app = new App({
  docker: { os: "windows" } // "linux" | "mac"
});
```

> Esto descargará la imagen oficial de **RabbitMQ** y creará un contenedor configurado para ejecutarse junto a la aplicación.
> Ideal para entornos de desarrollo sin necesidad de instalar Rabbit manualmente.

---

### Nota sobre el ORM

> 🔧 **Los modelos del ORM (entidades y repositorios) se encuentran actualmente en desarrollo.**
>
> Las clases `@Entity`, `@Id`, `@Column` y `CrudRepository` están disponibles en una versión inicial funcional, pero pueden sufrir cambios en futuras versiones para mejorar rendimiento y compatibilidad con PostgreSQL, MySQL y SQLite.

---

## CLI oficial de VyndraJS

VyndraJS incluye una **CLI potente y minimalista** que automatiza la creación de proyectos y componentes.

### Comandos disponibles

```bash
# Crear un nuevo proyecto base con configuración TypeScript y .env
vyndra create:app <nombre>

# Crear un módulo completo con subcarpetas
vyndra make:module <nombre>

# Crear un controller (crea el módulo si no existe)
vyndra make:controller <nombre>

# Crear un servicio
vyndra make:service <nombre>

# Crear un modelo (ORM)
vyndra make:model <nombre>

# Crear un repositorio
vyndra make:repository <nombre>

# Crear un listener para RabbitMQ
vyndra make:listener <nombre>
```

---

### Comando `create:app`

El comando `vyndra create:app <nombre>` genera automáticamente una aplicación base con:

- Estructura inicial `src/`
- Configuración de **TypeScript**
- Archivo `.env` listo para usar RabbitMQ
- Configuración inicial de `App` con soporte Docker opcional

Ejemplo:

```bash
vyndra create:app my-project
```

Estructura generada:

```
my-project/
 ├─ src/
 │   ├─ controllers/
 │   ├─ services/
 │   ├─ repositories/
 │   ├─ models/
 │   ├─ listeners/
 │   └─ index.ts
 ├─ .env
 ├─ tsconfig.json
 ├─ package.json
 └─ README.md
```

---

## Ejemplos de uso

### Definir una entidad

```ts
import { Id, Column, Entity } from "vyndra-js";

@Entity("users")
export class User {
  @Id({ name: "id" })
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, default: "example@gmail.com" })
  email!: string;
}
```

---

### Crear un repositorio CRUD

```ts
import { CrudRepository, Injectable, Repository } from "vyndra-js";
import { User } from "../models/user.model.js";

@Injectable()
@Repository(User)
export class UserRepository extends CrudRepository<User> {}
```

---

### Crear un servicio con AutoWired y Publish

```ts
import { AutoWired, Injectable, Publish } from "vyndra-js";
import { UserRepository } from "../repositories/user.repository.js";

@Injectable()
export class UserService {
  @AutoWired
  private userRepository!: UserRepository;

  async getAll() {
    return await this.userRepository.findAll();
  }

  @Publish("userUpdated")
  async update(user: any) {
    return this.userRepository.save(user);
  }
}
```

---

### Crear un controller

```ts
import { Controller, Get, Post, Request, Response, AutoWired } from "vyndra-js";
import { UserService } from "../services/user.service.js";

@Controller("/users")
export class UserController {
  @AutoWired
  private service!: UserService;

  @Get("/all")
  async getAll(req: Request, res: Response) {
    res.status(200).json(await this.service.getAll());
  }

  @Post("/")
  async post(req: Request, res: Response) {
    res.status(200).json(await this.service.post(req.body));
  }
}
```

---

### Crear un listener RabbitMQ

```ts
import { QueueListener, QueueListenerMethod } from "vyndra-js";

@QueueListener()
export class AuthListener {
  @QueueListenerMethod("userUpdated")
  handleEvent(message: any) {
    console.log("Evento recibido:", message);
  }
}
```

---

## Flujo de eventos con RabbitMQ

```
[Servicio con @Publish] ---> [Cola RabbitMQ] ---> [Listener con @QueueListenerMethod]
```

- Los **servicios** publican eventos con `@Publish("nombreEvento")`.
- RabbitMQ los enruta a la cola correspondiente.
- Los **listeners** los consumen y procesan automáticamente.

---

## Características principales

- Decoradores modernos (`@Controller`, `@Injectable`, `@Entity`, `@Repository`, `@Get`, `@Post`, etc.)
- nyección automática de dependencias (DI)
- ORM con CRUD básico (en desarrollo activo)
- Autoimportación de módulos y servicios
- Routing automático basado en decoradores
- Integración nativa con RabbitMQ
- CLI oficial para scaffolding rápido
- Diseño preparado para microservicios y gRPC (en próximas versiones)

---

## Roadmap

| Fase  | Estado | Descripción                                |
| ----- | ------ | ------------------------------------------- |
| 1️⃣ | ✅     | Routing y ORM básico                       |
| 2️⃣ | 🚧     | Microservicios y gRPC                       |
| 3️⃣ | ⏳     | Validaciones, autenticación, CLI extendida |
| 4️⃣ | 🔮     | ORM completo con migraciones y relaciones   |

---

## Licencia

**MIT License**

Dependencias:

- drizzle-orm – MIT
- pg / @types/pg – MIT
- reflect-metadata – MIT
- dotenv – MIT
- amqplib / @types/amqplib – MIT
- commander – MIT compatible

---
