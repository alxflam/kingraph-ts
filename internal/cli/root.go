package cli

import (
	"github.com/spf13/cobra"
)

func NewRootCmd() *cobra.Command {
	root := &cobra.Command{
		Use:          "kingraph-go",
		Short:        "Plots family trees using Go and Graphviz",
		SilenceUsage: true,
	}

	root.AddCommand(newKingraphCmd())
	root.AddCommand(newLatexFanChartCmd())
	root.AddCommand(newTransformCmd())
	root.AddCommand(newStatsCmd())

	return root
}

func Execute() error {
	return NewRootCmd().Execute()
}
