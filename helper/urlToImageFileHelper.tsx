export default async function urlToFile(url: string, fileName: string): Promise<File> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type })
}