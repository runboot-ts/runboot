import { TSTypeAnnotation, ParamPattern } from "@oxc-project/types";

export const getParamTypeAnnotation = (param: ParamPattern): TSTypeAnnotation => {
    let result: TSTypeAnnotation | null = null;
    if (
        param.type === "TSParameterProperty" &&
        param.parameter.type === "Identifier" &&
        param.parameter.typeAnnotation
    ) {
        result = param.parameter.typeAnnotation as TSTypeAnnotation;
    }

    if (
        !result &&
        param.type === "Identifier" &&
        (param as { typeAnnotation: TSTypeAnnotation }).typeAnnotation.type === "TSTypeAnnotation"
    ) {
        result = param.typeAnnotation || null;
    }

    if (!result) {
        throw new Error("Bad param type annotation");
    }

    return result;
};
