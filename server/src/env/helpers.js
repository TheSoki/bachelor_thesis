// @ts-check
/**
 * @template {import('zod').ZodFormattedError<Map<string, string>, string>} E
 * @param {E} errors - A generic parameter that flows through to the return type
 * @constraint {{import('zod').ZodFormattedError<Map<string, string>, string>}}
 */
const formatErrors = (errors) =>
    Object.entries(errors)
        .map(([name, value]) => {
            if (value && "_errors" in value) return `${name}: ${value._errors.join(", ")}\n`;
        })
        .filter(Boolean);

module.exports.formatErrors = formatErrors;
