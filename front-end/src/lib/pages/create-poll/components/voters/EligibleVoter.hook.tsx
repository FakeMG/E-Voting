type EligibleVoterHookProps = {
  voters: string[];
  setVoters: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function useEligibleVoter(props: EligibleVoterHookProps) {
  const { voters, setVoters } = props;

  const addEligibleVoter = (name: string) => {
    setVoters([...voters, name]);
  };

  const handleInputChange = (index: number, value: string) => {
    const newVoters = voters;
    newVoters[index] = value;

    setVoters([...newVoters]);
  };

  return { addEligibleVoter, handleInputChange };
}
