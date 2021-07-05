import { storage } from './firebaseConfig';

const imageDelete = (url) => {
	return storage.refFromURL(url).delete();
};

export default imageDelete;
