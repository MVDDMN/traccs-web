export const validateName = (name) => {
    if (!name) {
        return "• Name is required";
    }
    return "";
};

export const validateEmail = (email) => {
    if (!email) {
        return "• Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return "• Invalid email format";
    }
    return "";
};

export const validateUsername = (username) => {
    if (!username) {
        return "• Username is required";
    }
    // Add additional validation logic if needed
    return "";
};

export const validatePassword = (password) => {
    if (!password) {
        return "• Password is required";
    }

    // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    if (password.length < 8) {
        return "• Password must be at least 8 characters long";
    }
    if (password.length > 20) {
        return "• Password must be no longer than 20 characters";
    }
    if (!/[A-Z]/.test(password)) {
        return "• Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "• Password must contain at least one lowercase letter";
    }
    if (!/[@$!%*?&]/.test(password)) {
        return "• Password must contain at least one special character (@, $, !, %, *, ?, &)";
    }
    
    // If the password passes all the checks
    return "";
};

export const validateBarangay = (barangay) => {
    if (!barangay) {
        return "• Barangay is required";
    }
    // Add additional validation logic if needed
    return "";
};

export const validateType = (type) => {
    if (!type) {
        return "• Type is required";
    }
    // Add additional validation logic if needed
    return "";
};
