const oldSchoolCopy = (text: string) => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
};

export const copyToClipboard = async (value: string) => {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
        } else {
            throw new Error("writeText not supported");
        }
    } catch (e) {
        oldSchoolCopy(value);
    }
};
