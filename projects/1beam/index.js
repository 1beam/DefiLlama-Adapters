const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const Abis = require('./abi.json');
const { getTokenId } = require('./utils')
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  moonbeam: {
    pools: {
      'ob3p': '0x04e274f709e1ae71aff4f994b4267143ec6a381a',
      'ob3pbusd': '0x7e758319d46E0A053220e3728B3eE47a1979316a',
    },
    multiFeeDistribution: "0x0B7ad27AE2CBBC7A895dac054a5FfE818147fecd",
    chef: "0x265F223011521a6Cb222B1F828b04889a6bf50b3",
    ignoredLps: ['0xe7a7dfb89f84a0cf850bcd399d0ec906ab232e9d'],
    lpMarket: '0x8a2f167f307d633ba6999a3fb177caf05f719176', // 1BEAM/GLMR LP,
    reward: '0x19d2f0CF1FC41DE2b8fd4A98065AB9284E05Cf29' // 1BEAM
  },
  moonriver: {
    pools: {
      '1s3p': '0xb578a396e56388CbF398a12Dea9eb6B01b7c777f',
      '1s3pbusd': '0x008db1Cef0958e7f87A107b58F0dede796ce7962',
      '1s3pmim': '0x23A479A83e4FaC12C2096Ab1D79Ea7a788f4489E',
      '1s3pfrax': '0xF223B776C86E1ADa8fD205dBb804D1Fd6C87E05E',
      '1s3pavaxusd': '0x7179F2C31763f395082489588534F4abb3Dd4Be6',
      '1s3pwanusd': '0x02A105939Dc0C47cb6bD04f320dAa77Bd9E3Bb0D',
      '1s3pmai': '0xF6d85a44c4C4fb714C2C85Ed0e8Ad9f33Ebc4d72',
      '1s3pwanusd': '0x02A105939Dc0C47cb6bD04f320dAa77Bd9E3Bb0D',
      '1s3panyfrax': '0xF223B776C86E1ADa8fD205dBb804D1Fd6C87E05E'
    },
    multiFeeDistribution: "0x8972597520281E3826E140D5575Df9d6453330e9",
    chef: "0x2e8EbB30cD1a3792900B78f17de2f295f7FC67D6",
    ignoredLps: ['0x17da5445f3cd02b3f1cd820e6de55983fe80cf85'],
    lpMarket: '0x93f3b89FCCbEE5ffcb2734ee6E1B67561084D6A9', // 1SWAP_MOVR_LP,
    reward: '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B' // 1SWAP
  },
  cronos: {
    pools: {
      'ob3p': '0xa5fE50cF0199e4b2899A3caD96554eb2b5df688A',
    },
    multiFeeDistribution: "0x008db1Cef0958e7f87A107b58F0dede796ce7962",
    chef: "0x156e1d61cd02C7F99B5b0Fb5f37163312C7596bF",
    ignoredLps: ['0x6f61e4c3299ea49a19878821daf9d54aad8d9325'],
    lpMarket: '0x90498E253fD1Df9f5835dFc062C2E49AB6bFe845', // 1CRO_CRO_LP
    reward: '0x7A1803b4433A83819f9796564829b37f49841672' // 1CRO
  },
};

const poolTvl = async (chain, poolAddress, block) => {
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: Abis.swap.getTokenBalances,
      chain: chain,
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: Abis.swap.getTokens,
      chain: chain,
      block,
    }),
  ]);

  const sum = {};

  tokens.output.forEach((token, i) => {
    if (
      Contracts[chain].ignoredLps &&
      Contracts[chain].ignoredLps.includes(token.toLowerCase())
    ) {
      return;
    }
    const [symbol, decimals] = getTokenId(chain, token.toLowerCase());
    sum[symbol] = new BigNumber(balances.output[i]).div(new BigNumber(10).pow(decimals)).toNumber()
  });

  return sum;
};

async function calcPool2(masterchef, lpMarket, block, chain) {
  let balances = {};
  const lpBalance = await sdk.api.abi.call({
    target: lpMarket,
    params: [masterchef],
    abi: 'erc20:balanceOf',
    chain: chain,
    block,
  });
  let lpPositions = [];
  lpPositions.push({
    balance: new BigNumber(lpBalance.output),
    token: lpMarket,
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}


const moonbeamTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['moonbeam'];
  const tvl = {};

  for (let address of Object.values(Contracts.moonbeam.pools)) {
    const balances = await poolTvl(
      'moonbeam',
      address,
      block,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const moonriverTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['moonriver'];
  const tvl = {};

  for (let address of Object.values(Contracts.moonriver.pools)) {
    const balances = await poolTvl(
      'moonriver',
      address,
      block,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const cronosTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['cronos'];
  const tvl = {};

  for (let address of Object.values(Contracts.cronos.pools)) {
    const balances = await poolTvl(
      'cronos',
      address,
      block,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};


const moonbeamPool2 = async (timestamp, block, chainBlocks) => {
  return await calcPool2(
    Contracts.moonbeam.chef,
    Contracts.moonbeam.lpMarket,
    chainBlocks.moonbeam,
    "moonbeam"
  );
}

const moonriverPool2 = async (timestamp, block, chainBlocks) => {
  return await calcPool2(
    Contracts.moonriver.chef,
    Contracts.moonriver.lpMarket,
    chainBlocks.moonriver,
    "moonriver"
  );
}

const cronosPool2 = async (timestamp, block, chainBlocks) => {
  return await calcPool2(
    Contracts.cronos.chef,
    Contracts.cronos.lpMarket,
    chainBlocks.cronos,
    "cronos"
  );
}

module.exports = {
  moonbeam: {
    tvl: moonbeamTvl,
    pool2: moonbeamPool2,
    staking: staking(
      Contracts.moonbeam.multiFeeDistribution,
      Contracts.moonbeam.reward,
      "moonbeam"
    ),
  },
  moonriver: {
    tvl: moonriverTvl,
    pool2: moonriverPool2,
    staking: staking(
      Contracts.moonriver.multiFeeDistribution,
      Contracts.moonriver.reward,
      "moonriver"
    ),
  },
  cronos: {
    tvl: cronosTvl,
    pool2: cronosPool2,
    staking: staking(
      Contracts.cronos.multiFeeDistribution,
      Contracts.cronos.reward,
      "cronos"
    ),
  },
};
