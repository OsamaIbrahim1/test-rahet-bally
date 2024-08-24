export const emailRegex = new RegExp(
    /[A-Za-z0-9]{3,50}@(gmail|yahoo).com$/
)

export const passwordRegex = new RegExp(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/
);

export const titleRegex = new RegExp(
    /^[A-Za-z]{3,30}$/
)