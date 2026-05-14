package cli

import (
	"errors"
	"fmt"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/transform/latex"
	"github.com/spf13/cobra"
)

func newLatexFanChartCmd() *cobra.Command {
	var yamlPath string
	var generations int
	var ancestorLeaf string

	cmd := &cobra.Command{
		Use:   "latexFanChart",
		Short: "Transform to LaTeX fan chart",
		RunE: func(cmd *cobra.Command, args []string) error {
			if yamlPath == "" {
				return errors.New("--yaml is required")
			}
			if ancestorLeaf == "" {
				return errors.New("--ancestorLeaf is required")
			}

			data, err := kin.LoadFromFile(yamlPath)
			if err != nil {
				return err
			}

			result := latex.ToLatexGraph(data, generations, ancestorLeaf)
			fmt.Fprint(cmd.OutOrStdout(), result)
			return nil
		},
	}

	cmd.Flags().StringVarP(&yamlPath, "yaml", "y", "", "YAML input file")
	cmd.Flags().IntVar(&generations, "generations", 10, "Number of generations")
	cmd.Flags().StringVar(&ancestorLeaf, "ancestorLeaf", "", "Ancestor leaf")

	return cmd
}
