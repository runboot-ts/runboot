let idCount = 0;

export const getCountId = () => ++idCount;

export const formatToVarName = (value: string) => {
    return value[0].toLowerCase() + value.slice(1);
};
