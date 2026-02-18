export default function setPreviewImageHelper(file: File, setPreviewImage: (file: string) => void) {
    if (file) {
        const reader = new FileReader();
        let fileImage;
        reader.onloadend = () => {
            fileImage = reader.result as string;
            setPreviewImage(fileImage);
        }
        reader.readAsDataURL(file);
        return fileImage;
    }
}

