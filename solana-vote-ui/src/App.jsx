import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "../idl/multi_candidate_voting.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const programID = new PublicKey(idl.metadata.address);
const network = "https://api.devnet.solana.com";
const opts = {
  preflightCommitment: "processed",
};

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [program, setProgram] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const loadProvider = async () => {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new AnchorProvider(connection, solana, opts);
        const program = new Program(idl, programID, provider);
        setWallet(solana);
        setProgram(program);
        solana.connect();
      }
    };
    loadProvider();
  }, []);

  const createCandidate = async () => {
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("candidate"), Buffer.from(candidateName)],
      program.programId
    );

    await program.methods.initializeCandidate(candidateName).accounts({
      candidate: candidatePda,
      signer: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    }).rpc();

    alert("Candidate created!");
    fetchCandidates();
  };

  const vote = async (name) => {
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("candidate"), Buffer.from(name)],
      program.programId
    );
    const [voterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.vote(name).accounts({
      candidate: candidatePda,
      voter: voterPda,
      signer: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    }).rpc();

    alert("Vote cast!");
    fetchCandidates();
  };

  const fetchCandidates = async () => {
    const accounts = await program.account.candidate.all();
    setCandidates(accounts);
  };

  useEffect(() => {
    if (program) fetchCandidates();
  }, [program]);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🗳 Multi-Candidate Voting</h1>

      <Card className="mb-6">
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Enter candidate name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <Button onClick={createCandidate}>Create Candidate</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {candidates.map(({ account }, idx) => (
          <Card key={idx} className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold">{account.name}</p>
              <p className="text-sm text-muted-foreground">Votes: {account.voteCount.toString()}</p>
            </div>
            <Button onClick={() => vote(account.name)}>Vote</Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
