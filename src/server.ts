import "dotenv/config";

import fCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import multipart from "@fastify/multipart";

import fastify, { FastifyReply, FastifyRequest } from "fastify";

import { GENERIC_CATCH, message } from "./constants/messages";
import { areaRoutes } from "./routes/area.routes";
import { authRoutes } from "./routes/auth.routes";
import { courseRoutes } from "./routes/course.routes";
import { employeeRoutes } from "./routes/employee.routes";
import { preferencesRoutes } from "./routes/preferences.routes";
import { processorRoutes } from "./routes/processor.routes";
import { subareaRoutes } from "./routes/subarea.routes";
import { subjectRoutes } from "./routes/subject.routes";
import { sysConfigRoutes } from "./routes/sysconfig.routes";


class Application {
    // Configuração de constantes da classe em modo privado
    // Instância do servidor
    private server = fastify();
    // Porta no qual o servidor irá rodar, puxando das variáveis de ambiente, caso
    // não exista define a porta 8080 como padrão
    private port = process.env.PORT || "8080";
    
    // Construtor da classe: Puxa o método de inicialização assim que a classe é instanciada
    constructor() {
        this.bootstrap();
    }

    // Método destinado a aplicar as configurações do servidor
    private async setConfigs(): Promise<void> {
        message("alert", "Aplicando configurações do servidor...");
        
        try {
            // Configuração para aceitar multipart formdata
            await this.server.register(multipart);

            // Configuração do CORS (Cross-Origin Resource Sharing)
            await this.server.register(cors, {
                origin: "*",
                allowedHeaders: "*",
            });

            // Configuração do JWT (JSON Web Token)
            await this.server.register(fjwt, { secret: process.env.SECRET_TOKEN || "@t0k3n_s3cr3t0" });

            // Handle para pegar a instância do JWT
            this.server.addHook("preHandler", (request: FastifyRequest, response: FastifyReply, next) => {
                request.jwt = this.server.jwt;
                return next();
            });

            // Configuração de Cookies
            this.server.register(fCookie, {
                secret: process.env.SECRET_TOKEN || "@t0k3n_s3cr3t0",
                hook: "preHandler",
            });

            message("success", "Configurações aplicadas com sucesso!");
        } catch (err) {
            message("error", GENERIC_CATCH, err);
        }
    }

    // Método responsável por criar todas as rotas
    private async buildRoutes(): Promise<void> {
        message("alert", "Criando rotas...");

        try {
            const defineApi = (path: string) => `/api/v1/${path}`;

            await this.server.register(areaRoutes, { prefix: defineApi("area") });
            await this.server.register(subareaRoutes, { prefix: defineApi("subarea") });
            await this.server.register(subjectRoutes, { prefix: defineApi("subject") });
            await this.server.register(courseRoutes,   { prefix: defineApi("course") });
            await this.server.register(employeeRoutes, { prefix: defineApi("employee") });
            await this.server.register(sysConfigRoutes, { prefix: defineApi("sysconfig") });
            await this.server.register(preferencesRoutes, { prefix: defineApi("preferences") });
            
            await this.server.register(authRoutes, { prefix: defineApi("auth") });

            await this.server.register(processorRoutes, { prefix: defineApi("processor") });

            message("success", "Rotas criadas com sucesso!");
        } catch (err) {
            message("error", GENERIC_CATCH, err);
        }
    }

    // Método que abre uma porta para o servidor rodar
    private listen(): void {
        this.server.listen({ host: "0.0.0.0", port: parseInt(this.port) })
            .then(() => message("success", `O servidor está rodando em http://localhost:${this.port}/`))
            .catch((err) => message("error", GENERIC_CATCH, err));
    }

    // Método que inicializa e ordena todos os outros
    async bootstrap(): Promise<void> {
        await this.setConfigs();
        await this.buildRoutes();

        this.listen();
    }
}

const app = new Application();

export default app;