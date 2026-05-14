package render

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/reduce"
)

func Render(data kin.KinModel, options Options) (string, error) {
	if options.AncestorGraph && options.AncestorLeaf != "" {
		reduced, err := reduce.ToAncestors(data, options.AncestorLeaf)
		if err != nil {
			return "", err
		}
		data = reduced
	}

	dot := RenderGraph(data, options.Theme, options.DrawDirection)

	switch options.Format {
	case "dot":
		return dot, nil
	case "svg":
		return renderSVG(dot)
	default:
		return "", errors.New("unsupported format")
	}
}

func renderSVG(dot string) (string, error) {
	cmd := exec.Command("dot", "-Tsvg")
	cmd.Stdin = bytes.NewBufferString(dot)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		if stderr.Len() > 0 {
			return "", fmt.Errorf("dot failed: %s", stderr.String())
		}
		return "", err
	}

	return stdout.String(), nil
}
