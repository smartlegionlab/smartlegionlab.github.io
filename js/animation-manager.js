class PriorityAnimationManager {
    constructor() {
        this.hasInitializedLazy = false;
    }

    initImmediate() {
        this.initAvatarAnimation();
    }

    initLazy() {
        if (this.hasInitializedLazy) return;

        this.initScrollAnimations();
        this.initCounters();
        this.hasInitializedLazy = true;
    }

    initAvatarAnimation() {
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            setTimeout(() => {
                avatar.style.animation = 'avatarMorph 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards';
            }, 500);
        }
    }
}