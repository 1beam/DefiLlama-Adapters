const TokenMaps = {
  '0x765277eebeca2e31912c9946eae1021199b39c61': ['dai', 18], //moonbeam
  '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b': ['usd-coin', 6], //moonbeam
  '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73': ['tether', 6], //moonbeam
  '0xa649325aa7c5093d12d6f98eb4378deae68ce23f': ['binance-usd', 18], //moonbeam
  '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844': ['dai', 18], //moonriver
  '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d': ['usd-coin', 6], //moonriver
  '0xb44a9b6905af7c801311e8f4e76932ee959c663c': ['tether', 6], //moonriver
  '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818': ['binance-usd', 18], //moonriver
  '0x0cae51e1032e8461f4806e26332c030e34de3adb': ['magic-internet-money', 18], //moonriver
  '0x965f84d915a9efa2dd81b653e3ae736555d945f4': ['anyfrax', 18], //moonriver
  '0x1A93B23281CC1CDE4C4741353F3064709A16197d': ['frax', 18], //moonriver
  '0xfb2019dfd635a03cfff624d210aee6af2b00fc2c': ['mai', 18], //moonriver
  '0xd8b99eae34afdf1a9bfa5770066404ee4468d0f2': ['usd-coin', 6], //moonriver AVAX bridge
  '0xf97c8556af29089d5d1627096958187b11f1915c': ['tether', 6], //moonriver AVAX bridge
  '0x26dfff76d9123a1c79279abc29b676c48a8bd77e': ['dai', 18], //moonriver AVAX bridge
  '0x748134b5f553f2bcbd78c6826de99a70274bdeb3': ['usd-coin', 6], //moonriver WANCHAIN bridge
  '0xe936caa7f6d9f5c9e907111fcaf7c351c184cda7': ['tether', 6], //moonriver WANCHAIN bridge
  '0xf2001b145b43032aaf5ee2884e456ccd805f677d': ['dai', 18], //cronos
  '0xc21223249ca28397b4b6541dffaecc539bff0c59': ['usd-coin', 6], //cronos
  '0x66e428c3f67a68878562e79a0234c1f83c208770': ['tether', 6], //cronos
}

/**
 * 
 * @param {string} address token address in lower case
 * @returns coingecko id and decimals
 */
function getTokenId(address) {
  return TokenMaps[address]
}

module.exports = {
  getTokenId
}