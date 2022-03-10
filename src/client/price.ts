export async function getPrice(): Promise {
    console.log('Getting data from ', readingPubkey.toBase58())
    const priceFeedAccount = "FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf"
    const AggregatorPublicKey = new PublicKey(priceFeedAccount)
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: readingPubkey, isSigner: false, isWritable: true },
      { pubkey: AggregatorPublicKey, isSigner: false, isWritable: false }],
      programId,
      data: Buffer.alloc(0), // All instructions are hellos
    })
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(instruction),
      [payer],
    )
  }

  export async function reportPrice(): Promise {
    const accountInfo = await connection.getAccountInfo(readingPubkey)
    if (accountInfo === null) {
      throw new Error('Error: cannot find the aggregator account')
    }
    const latestPrice = borsh.deserialize(
      AggregatorSchema,
      AggregatorAccount,
      accountInfo.data,
    )
    console.log("Current price of SOL/USD is: ", latestPrice.answer.toString())
  }