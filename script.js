(async () => {
    class Image {
        constructor (src) {
            this.src = src;
            this.obj = null;
        }
        async getData () {
            const response = await fetch(this.src);
            const blob = await response.blob();
            this.obj = URL.createObjectURL(blob);
        }
    } 

    let pieces = [];
    //size for pieces in vmin
    let size = 25;
    let selectedPiece = null;
    let vmin = (window.innerHeight<window.innerWidth?window.innerHeight:window.innerWidth)/100;
    const piecesContainer = document.getElementById("pieces-container");
    let piecesContainerRect = piecesContainer.getBoundingClientRect();
    const slots = []
    class Slot {
        #dom;
        constructor(row, col) {
            this.row = row;
            this.col = col;
            this.number = this.row*3 + this.col;
            this.#dom = document.getElementById(`${row}-${col}`);
            this.rect = this.#dom.getBoundingClientRect();
            this.center = this.getCenter();
            this.occupied = false;
        }
        updatePos() {
            this.rect = this.#dom.getBoundingClientRect();
            this.center = this.getCenter();
        }
        getCenter() {
            let top = this.rect.top + size*vmin/2;
            let left = this.rect.left + size*vmin/2;
            return {top, left}
        }
        select() {
            this.#dom.classList.add("closest");
        }
        unselect() {
            this.#dom.classList.remove("closest");
        }
    }
    class Piece {
        #dom;
        constructor (img, num) {
            this.#dom = document.createElement("div");
            this.#dom.classList.add("piece");
            this.img = img;
            this.num = num;
            this.#dom.style.zIndex = Math.floor(Math.random*100 + 10);
            this.closest = null;
            this.smoothMove;
            this.mouseOffset = null;
            this.moved = false;
            this.originTop = Math.floor(Math.random()*(piecesContainerRect.height - size*vmin));
            if (this.originTop < 0) this.originTop = 0;
            this.top = this.originTop;
            this.originLeft = Math.floor(Math.random()*(piecesContainerRect.width - size*vmin));
            this.left = this.originLeft;
            if (this.originLeft < 0) this.originLeft = 0;
            this.#dom.style.top = `${this.originTop}px`;
            this.#dom.style.left = `${this.originLeft}px`;
            piecesContainer.appendChild(this.#dom);
            this.#dom.style.backgroundImage = `url(${img.obj})`;
            this.setPosition();
            this.#dom.addEventListener("mousedown", e => {
                if (!this.smoothMove) this.beginMouseFollow(e);
            });
            this.#dom.addEventListener("touchstart", e => {
                if (!this.smoothMove) this.beginMouseFollow(e);
            });
        }
        setPosition() {
            switch (this.num) {
                case 0:
                    this.#dom.style.backgroundPosition = "0% 0%";
                    break;
                case 1:
                    this.#dom.style.backgroundPosition = "50% 0";
                    break;
                case 2:
                    this.#dom.style.backgroundPosition = "100% 0%";
                    break;
                case 3:
                    this.#dom.style.backgroundPosition = "0% 50%";
                    break;
                case 4:
                    this.#dom.style.backgroundPosition = "50% 50%";
                    break;
                case 5:
                    this.#dom.style.backgroundPosition = "100% 50%";
                    break;
                case 6:
                    this.#dom.style.backgroundPosition = "0% 100%";
                    break;
                case 7:
                    this.#dom.style.backgroundPosition = "50% 100%";
                    break;
                case 8:
                    this.#dom.style.backgroundPosition = "100% 100%";
                    break;
            }
        }
        updateOriginPos() {
            this.#dom.classList.add("smooth-move");
            this.originTop = Math.floor(Math.random()*(piecesContainerRect.height - size*vmin));
            if (this.originTop < 0) this.originTop = 0;
            this.originLeft = Math.floor(Math.random()*(piecesContainerRect.width - size*vmin));
            if (this.originLeft < 0) this.originLeft = 0;
            if (!this.moved) {
                this.#dom.style.top = `${this.originTop}px`;
                this.#dom.style.left = `${this.originLeft}px`;
                this.top = this.originTop;
                this.left = this.originLeft;
            }
            if (this.smoothMove) {
               clearTimeout(this.smoothMove);
            }
            this.smoothMove = setTimeout(() => {
                this.#dom.classList.remove("smooth-move");
                this.smoothMove = null;
            }, 500);
        }
        getMouseOffset(e) {
            let bodyPos = this.getBodyPos();
            let top = e.clientY - bodyPos.top;
            let left = e.clientX - bodyPos.left
            return {top, left};
        }
        getBodyPos() {
            let top = this.top + piecesContainerRect.top;
            let left = this.left + piecesContainerRect.left;
            return {top, left};
        }
        //container coords
        setPos(pos) {
            this.top = pos.top;
            this.left = pos.left;
            this.#dom.style.top = `${pos.top}px`;
            this.#dom.style.left = `${pos.left}px`;
        }
        getMousePos(e) {
            let top = e.clientY - piecesContainerRect.top;
            let left = e.clientX - piecesContainerRect.left;
            return {top, left};
        }
        getContainerPos(bodyPos) {
            let top = bodyPos.top - piecesContainerRect.top;
            let left = bodyPos.left - piecesContainerRect.left;
            return {top, left};
        } 
        smoothMoveToCoord (coord) {
            this.#dom.classList.add("smooth-move");
            this.top = coord.top;
            this.left = coord.left;
            this.#dom.style.top = `${coord.top}px`;
            this.#dom.style.left = `${coord.left}px`;
            if (this.smoothMove) {
                clearTimeout(this.smoothMove);
             }
             this.smoothMove = setTimeout(() => {
                 this.#dom.classList.remove("smooth-move");
                 this.smoothMove = null;
             }, 500);
        }
        beginMouseFollow(e) {
            if (this.closest) {
                this.closest.occupied = false;   
            }
            if (this.smoothMove) {
                clearTimeout(this.smoothMove);
            }
            if (!this.mouseOffset) {
                let mousePos = this.getMouseOffset(e)
                this.mouseOffset = {top: mousePos.top, left: mousePos.left}
            }
            selectedPiece = this;
        }
        endMouseFollow(e) {
            if (this.closest && (this.closest.occupied===false || this.closest.occupied === this.num)) {
                this.moved = true;
                this.closest.occupied = this.num;
                this.closest.select;
                this.smoothMoveToCoord(this.getContainerPos({top: this.closest.rect.top, left: this.closest.rect.left}));
            } else if (this.top>0&&this.left>0) {
                this.#dom.classList.add("smooth-move");
                this.originTop = this.top;
                this.originLeft = this.left;
                if (!this.moved) {
                    this.#dom.style.top = `${this.originTop}px`;
                    this.#dom.style.left = `${this.originLeft}px`;
                }
                if (this.smoothMove) {
                   clearTimeout(this.smoothMove);
                }
                this.smoothMove = setTimeout(() => {
                    this.#dom.classList.remove("smooth-move");
                    this.smoothMove = null;
                }, 500);
            }
            
            else {
                this.moved = false;
                this.smoothMoveToCoord({top: this.originTop, left: this.originLeft});
            }
            this.mouseOffset = null;
        }
        getCenter() {
            let bodyPos = this.getBodyPos();
            let top = bodyPos.top + size*vmin/2;
            let left = bodyPos.left + size*vmin/2;
            return {top, left};
        }
        findClosest() {
            let closest = [null, size*vmin+1];
            let center = this.getCenter();
            slots.forEach((slot, index) => {
                let distance = Math.sqrt((slot.center.top - center.top)**2 + (slot.center.left - center.left)**2);
                if (distance<closest[1]) closest = [index, distance];
            });
            return closest[0];
        }
        followMouse(e) {
            let mousePos = this.getMousePos(e);
            let top = mousePos.top - this.mouseOffset.top;
            let left = mousePos.left - this.mouseOffset.left;
            if (top>piecesContainerRect.height - size*vmin) top = piecesContainerRect.height - size*vmin;
            if (top<-piecesContainerRect.top) top = -piecesContainerRect.top;
            if (left>piecesContainerRect.width - size*vmin) left = piecesContainerRect.width - size*vmin;
            if (left<-piecesContainerRect.left) left = -piecesContainerRect.left;
            this.setPos({top, left});
            let closest = slots[this.findClosest()];
            if (closest) {
                if (this.closest) this.closest.unselect();
                this.closest = closest;
                this.closest.select();
            } 
        }
        
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            slots.push(new Slot(i, j));
        }
    }
    
    const populatePieces = (image) => {
        pieces = [];
        for (let i = 0; i < 9; i++) {
            pieces.push(new Piece(image, i));
        }
    }

    let image = null
    const nextGame = async () => {
        slots.forEach(slot => {
            slot.unselect();
            slot.occupied = false;
        });
        document.getElementById("congrats-screen").classList.remove("visible");
        pieces = []
        piecesContainer.innerHTML = "";
        const flowerSRC = `./flower-${Math.floor(Math.random()*91)}.webp`
        if (image) URL.revokeObjectURL(image.obj);
        image = new Image(flowerSRC);
        await image.getData();
        populatePieces(image);
    }

    nextGame();

    document.getElementById("next-button").addEventListener("click", () => {
        nextGame();
    })

    let mousemoved = false;
    window.addEventListener("resize", () => {
        vmin = (window.innerHeight<window.innerWidth?window.innerHeight:window.innerWidth)/100;
        piecesContainerRect = piecesContainer.getBoundingClientRect();
        slots.forEach(slot => slot.updatePos());
        pieces.forEach(piece => {
            piece.updateOriginPos();
            if (piece.moved) {
                piece.smoothMoveToCoord(piece.getContainerPos({top: piece.closest.rect.top, left: piece.closest.rect.left}));
            }
        });
    })
    setInterval(() => {
        mousemoved = false;
    }, 25);
    window.addEventListener("mousemove", (e) => {
        try {
            if (!mousemoved) {
                if (selectedPiece) selectedPiece.followMouse(e);
                mousemoved = true;
            }
        } catch (e) {
            selectedPiece = null;
        }
    });
    window.addEventListener("touchmove", (e) => {
        try {
            if (!mousemoved) {
                if (selectedPiece) selectedPiece.followMouse(e);
                mousemoved = true;
            }
        } catch (e) {
            selectedPiece = null;
        } 
    });
    window.addEventListener("mouseup", () => {
        selectedPiece.endMouseFollow();
        let gameWon = true;
        slots.forEach((slot, ind) => {
            if (slot.occupied===false || slot.occupied!==ind) {
                gameWon = false;
            }
        });
        if (gameWon) {
            document.getElementById("congrats-screen").classList.add("visible");
        }
    });
    window.addEventListener("touchend", () => {
        selectedPiece.endMouseFollow();
        let gameWon = true;
        slots.forEach((slot, ind) => {
            if (slot.occupied===false || slot.occupied!==ind) {
                gameWon = false;
            }
        });
        if (gameWon) {
            document.getElementById("congrats-screen").classList.add("visible");
        }
    });
})();