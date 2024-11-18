const REQUIRED_FIELD_MESSAGE = 'This field is required';
const passwordMinLength = 8;

const fullName = {
    errorMessages: {
        emptyFullName: REQUIRED_FIELD_MESSAGE,
    }
};
const email = {
    errorMessages: {
        emptyEmail: REQUIRED_FIELD_MESSAGE,
        invalidEmail: 'Invalid email',
        duplicateEmail: 'This email is already in use',
    },
};

const min = 8;
const password = {
    length: {
        min,
    },
    errorMessages: {
        emptyPassword: REQUIRED_FIELD_MESSAGE,
        invalidLength: `Must contain at least ${min} characters`,
        noUpperCase: 'Must have at least one uppercase character',
        noLowerCase: 'Must have at least one lowercase character',
        noDigit: 'Must have at least one digit',
    },
};

const passwordConfirmation = {
    errorMessages: {
        mismatch: 'Passwords do not match',
    },
};

const phoneNumber = {
    locale: 'bn-BD',
    errorMessages: {
        invalidPhoneNumber: 'Invalid phone number',
    }
};

export default {
    fullName,
    email,
    password,
    passwordConfirmation,
    phoneNumber,
}