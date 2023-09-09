import React from 'react'
import Head from 'next/head'
import Link from 'next/link';

const Index = () => (
  <>
    <Head>
      <title>BISOGO PRICE CONVERTER</title>
    </Head>
    <h2>This is a test webapp</h2>
    <div class="container">
      <h3>NAVIGATION</h3>
      <ul>
        <li>
          <Link href="/pod-products">
            <a>1. Pod Products</a>
          </Link>
        </li>
        <li>
          <Link href="/all-products">
            <a>2. All Shopify Products</a>
          </Link>
        </li>
      </ul>
    </div>
  </>
);

export default Index;
