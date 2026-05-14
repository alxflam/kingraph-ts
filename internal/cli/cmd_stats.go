package cli

import (
	"errors"
	"fmt"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/stats"
	"github.com/spf13/cobra"
)

func newStatsCmd() *cobra.Command {
	var yamlPath string

	cmd := &cobra.Command{
		Use:   "stats",
		Short: "Kingraph statistics",
		RunE: func(cmd *cobra.Command, args []string) error {
			if yamlPath == "" {
				return errors.New("--yaml is required")
			}

			data, err := kin.LoadFromFile(yamlPath)
			if err != nil {
				return err
			}

			fmt.Fprint(cmd.OutOrStdout(), stats.Statistics(data))
			return nil
		},
	}

	cmd.Flags().StringVarP(&yamlPath, "yaml", "y", "", "YAML input file")

	return cmd
}
