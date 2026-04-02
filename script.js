const background = document.querySelector('.interactive-background');

// 2. The 'pointerdown' Fix: Works instantly on both mouse and touch screens
background.addEventListener('pointerdown', function() {
    
    // Debugging: If you don't see this in the console, your touch is being blocked
    console.log("Background touched!"); 

    // 3. The "Reflow" Fix: Allows the animation to trigger multiple times

    // Step A: Remove the class if it's already there from a previous tap
    background.classList.remove('start-animation');

    // Step B: Trigger a reflow (forces the browser to recalculate layout)
    void background.offsetWidth;

    // Step C: Add the class back to fire the animation again
    background.classList.add('start-animation');
});