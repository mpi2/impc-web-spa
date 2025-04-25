import { useState, createContext } from "react";
import { Button } from "react-bootstrap";

const GeneComparatorContext = createContext(null);

export const GeneComparatorProvider = ({ children }) => {
  const [genes, setGenes] = useState([]);

  const addGene = (gene) => {
    if (gene && !genes.includes(gene)) {
      const newGenes = [...genes, gene];
      setGenes(newGenes);
      return newGenes;
    }
    return genes;
  };

  const removeGene = (gene) => {
    if (gene && genes.includes(gene)) {
      genes.splice(genes.indexOf(gene));
      setGenes(genes);
    }
  };

  const resetGenes = (genes: string[]) => {
    setGenes(genes);
  };

  return (
    <GeneComparatorContext.Provider
      value={{ genes, addGene, removeGene, resetGenes }}
    >
      {children}
    </GeneComparatorContext.Provider>
  );
};

export const useGeneComparator = () => React.useContext(GeneComparatorContext);

export const GeneComparatorTrigger = ({ current }: { current?: string }) => {
  return (
    <Button
      style={{
        position: "fixed",
        zIndex: 100,
        bottom: -100,
        right: 100,
        transition: ".3s ease transform",
      }}
      variant="primary"
    >
      Compare Genes{" "}
      <span
        className="bg-white"
        style={{
          display: "inline-block",
          height: 22,
          padding: "0 7px",
          borderRadius: 11,
          marginLeft: 6,
          fontWeight: "bold",
          color: "#000",
        }}
      ></span>
    </Button>
  );
};
