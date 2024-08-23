export const validateFormData = (formData) => {
    const errors = {};

    if (!formData.itemname) {
        errors.itemname = "• Item name is required";
    }

    if (!formData.type) {
        errors.type = "• Resource type is required";
    }

    if (formData.quantity <= 0) {
        errors.quantity = "• Quantity must be greater than 0";
    }

    if (!formData.description) {
        errors.description = "• Description is required";
    }

    return errors;
};

export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};
