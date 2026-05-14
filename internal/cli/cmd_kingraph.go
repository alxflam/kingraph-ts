package cli

import (
	"errors"
	"fmt"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/render"
	"github.com/spf13/cobra"
)

func newKingraphCmd() *cobra.Command {
	var yamlPath string
	var format string
	var theme string
	var drawDirection string
	var ancestorGraph bool
	var ancestorLeaf string

	cmd := &cobra.Command{
		Use:   "kingraph",
		Short: "Generate kingraph from YAML",
		RunE: func(cmd *cobra.Command, args []string) error {
			if yamlPath == "" {
				return errors.New("--yaml is required")
			}

			data, err := kin.LoadFromFile(yamlPath)
			if err != nil {
				return err
			}

			result, err := render.Render(data, render.Options{
				Format:        format,
				Theme:         theme,
				DrawDirection: drawDirection,
				AncestorGraph: ancestorGraph,
				AncestorLeaf:  ancestorLeaf,
			})
			if err != nil {
				return err
			}

			fmt.Fprint(cmd.OutOrStdout(), result)
			return nil
		},
	}

	cmd.Flags().StringVarP(&yamlPath, "yaml", "y", "", "YAML input file")
	cmd.Flags().StringVarP(&format, "format", "f", "svg", "Target format (dot or svg)")
	cmd.Flags().StringVarP(&theme, "theme", "t", "dark", "Theme (light or dark)")
	cmd.Flags().StringVarP(&drawDirection, "drawDirection", "d", "LR", "Draw direction (LR or TB)")
	cmd.Flags().BoolVar(&ancestorGraph, "ancestorGraph", false, "Ancestor graph")
	cmd.Flags().StringVar(&ancestorLeaf, "ancestorLeaf", "", "Ancestor leaf")

	return cmd
}
