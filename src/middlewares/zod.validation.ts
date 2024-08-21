import { FastifyReply, FastifyRequest } from "fastify";
import { ZodSchema } from "zod";

export function ZodValidator (schema: ZodSchema ) {
    return function (request: FastifyRequest, response: FastifyReply, next) {
        try {
            if (!request.body)
                response
                    .status(400)
                    .send({ message: "É necessário enviar o corpo da requisição." });

            const validate = schema.safeParse(request.body);

            if (validate.success === true) {
                request.body = validate.data;

                next();
            } else {
                response
                    .status(400)
                    .send({ error: validate.error });
            }
			
        } catch (error) {
            response
                .status(500)
                .send({ error });
        }
    };
}