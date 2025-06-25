const formatPhoneNumberServer = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('07')) {
        return '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('01')) {
        return '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('+2547')) {
        return '254' + cleaned.slice(4);
    } else if (cleaned.startsWith('+2541')) {
        return '254' + cleaned.slice(4);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        return '254' + cleaned;
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
        return cleaned;
    }

    throw new Error('Invalid phone number format');
};

module.exports = formatPhoneNumberServer;