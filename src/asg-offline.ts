namespace angularSuperGallery {

    export class DataFromImage {
		public image?: any;
		public urlOfImage?: string;
		constructor() {
			this.image = null;
			this.urlOfImage = null;
		}
	};

	export class DataBaseIndexedDB {
		nameDataBase: string;
		databaseLocal: any;
		debug: boolean;

		public abreBanco(callBack: { (): void; }) {
			let self = this;
			let request = indexedDB.open(self.nameDataBase, 1);

			request.onerror = function (event: any) {
				console.error("Error creating/accessing IndexedDB database");
			};

			request.onsuccess = function (event: any) {
				self.log("Success creating/accessing IndexedDB database");
				self.databaseLocal = event.target.result;
				self.databaseLocal.onerror = function (event) {
					self.log("Error creating/accessing IndexedDB database");
				};
				callBack();
			}

			request.onupgradeneeded = function (event: any) {
				self.log("Creating object store");
				self.databaseLocal = event.target.result;
				self.databaseLocal.createObjectStore("images");
			};
		}

		constructor(nameDataBase: string) {
			let self = this;
			self.nameDataBase = nameDataBase;
			self.databaseLocal = null;
			self.debug = false;
		}

		public log(event: string, data?: any) {
			if (this.debug) {
				console.log(event, data ? data : null);
			}
		}
	}
	declare const Promise: any; //error TS2693: 'Promise' only refers to a type, but is being used as a value here. 

	export class LoaderImageOnOff {
		private debug: boolean;
		private urlImage: string;
		private tagOfImagem: any;
		private dataBaseIndexedDB: DataBaseIndexedDB;
		constructor(BancoDeDadosIndexedDB: DataBaseIndexedDB, urlImagem: string, tagDaImagem: any) {
			this.urlImage = urlImagem;
			this.tagOfImagem = tagDaImagem;
			this.dataBaseIndexedDB = BancoDeDadosIndexedDB;
			this.debug = false;
			this.getImagem();
		}

		private getImagem = function () {
			let selfBase = this;
			this.retrieveImage()
				.then(function (necessitaDeDownload: boolean) {
					if (necessitaDeDownload) {
						selfBase.downloadImage()
							.then(selfBase.storeImage.bind(selfBase));
					}
				});
		}

		private retrieveImage() { 
			let selfBase = this;
			var transaction = selfBase.dataBaseIndexedDB.databaseLocal.transaction(["images"], "readonly");
			return new Promise(function (resolve, reject) {
				transaction.objectStore("images").get(selfBase.urlImage).onsuccess = function (event) {
					var imgFile = event.target.result;
					var img = selfBase.tagOfImagem;

					let necessitaDeDownload: boolean = true;
					if (imgFile) {
						selfBase.log("Retrieved image from indexedDB " + selfBase.urlImage, imgFile);
						var imgURL = URL.createObjectURL(imgFile);
						img.setAttribute("src", imgURL);

						necessitaDeDownload = false;
						resolve(necessitaDeDownload);
					} else {
						selfBase.log("image not found " + selfBase.urlImage);
						resolve(necessitaDeDownload);
					}
				};
			});
		}

		private downloadImage() {
			let selfBase = this;
			let xhr = new XMLHttpRequest();
			let url = selfBase.urlImage;

			selfBase.log('Going to load image from ', url);

			return new Promise(function (resolve, reject) { //declare const Promise: any; //error TS2693: 'Promise' only refers to a type, but is being used as a value here.
				xhr.open("GET", url, true);
				xhr.responseType = "blob";

				xhr.onreadystatechange = function () {
					if (this.readyState === 4) {
						if (this.status >= 200 && this.status < 300) {
							selfBase.log('blob received ' + selfBase.urlImage, this.response);
							let dadosDaImagem = new DataFromImage();
							dadosDaImagem.image = this.response;
							dadosDaImagem.urlOfImage = selfBase.urlImage;
							resolve(dadosDaImagem);
						}
					}
				};

				xhr.send();
			});
		};

		private storeImage(dadosDaImagem: DataFromImage) {
			let selfBase = this;
			selfBase.log("Storing image in IndexedDB " + selfBase.urlImage);

			var transaction = selfBase.dataBaseIndexedDB.databaseLocal.transaction(["images"], "readwrite");
			var put = transaction.objectStore("images").put(dadosDaImagem.image, "" + dadosDaImagem.urlOfImage);
			put.onsuccess = function () {
				selfBase.retrieveImage();
			};
		};

		public log(event: string, data?: any) {
			if (this.debug) {
				console.log(event, data ? data : null);
			}
		}

	}
}

