export async function getDisplayStream(){
    // @ts-ignore
    return navigator.mediaDevices.getDisplayMedia();
}