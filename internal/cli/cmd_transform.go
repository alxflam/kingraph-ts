package cli

import (
	"errors"
	"fmt"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/transform/gedcom"
	"github.com/spf13/cobra"
)

func newTransformCmd() *cobra.Command {
	var yamlPath string
	var format string

	cmd := &cobra.Command{
		Use:   "transform",
		Short: "Transform kingraph file",
		RunE: func(cmd *cobra.Command, args []string) error {
			if yamlPath == "" {
				return errors.New("--yaml is required")
			}

			data, err := kin.LoadFromFile(yamlPath)
			if err != nil {
				return err
			}

			switch format {
			case "gedcom":
				fmt.Fprint(cmd.OutOrStdout(), gedcom.ToGedcom(data))
				return nil
			case "xml":
				return errors.New("XML is not supported")
			default:
				return errors.New("unsupported format")
			}
		},
	}

	cmd.Flags().StringVarP(&yamlPath, "yaml", "y", "", "YAML input file")
	cmd.Flags().StringVarP(&format, "format", "f", "gedcom", "Target format (gedcom)")

	return cmd
}
