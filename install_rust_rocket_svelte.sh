# Install rust-rocket-svelte app framework from https://github.com/joemooney/rust-rocket-svelte on a new Raspberry Pi
echo "Install curl"
sudo apt install curl
echo "Install git"
sudo apt install git
echo "Install npm"
sudo apt install npm
echo "Install rust and cargo (Rust's package manager)"
curl https://sh.rustup.rs -sSf | sh
echo "clone, or better yet your github cli tool"
git clone https://github.com/joemooney/rust-rocket-svelte
echo "Add rust to env"
source $HOME/.cargo/env
echo "Set rust auto-updates"
#rustup override set nightly
rustup default nightly-2021-10-05
cd rust-rocket-svelte
npm install
npm i svelte-material-ui
npm i -D @smui/data-table
npm i -D @smui/tab
npm i -D @smui/tab-bar
npm i svelte-material-icons

# Run npm and cargo in separate terminals
# Terminal 1: 
npm run dev  
# Terminal 2: 
cargo run
