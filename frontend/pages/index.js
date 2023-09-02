import React from 'react'
import Head from 'next/head'
import styled from 'styled-components';
import ShopifyProducts from '../components/ShopifyProducts';

const Index = () => (
  <>
    <Head>
      <title>Test web app | POD products</title>
    </Head>
    <p>This is a test webapp</p>
    <ShopifyProducts />
  </>
);

export default Index;
