import { storage } from './firebaseConfig';

const getExtension = (fname) => {
	return fname.slice(((fname.lastIndexOf('.') - 1) >>> 0) + 2);
};

const imageUpload = (image, folder) => {
	const uploadTask = storage
		.ref(`${folder}/${new Date().getTime()}.${getExtension(image.name)}`)
		.put(image);
	return uploadTask.then((snapshot) => snapshot.ref.getDownloadURL());
};

export default imageUpload;
