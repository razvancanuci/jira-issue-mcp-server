import { z } from 'zod';

// Base mark schema
const MarkSchema = z.object({
    type: z.enum([
        'strong',
        'em',
        'code',
        'strike',
        'underline',
        'link',
        'textColor',
        'alignment',
        'subsup'
    ]),
    attrs: z.record(z.any()).optional()
});

// Text node schema
const TextNodeSchema = z.object({
    type: z.literal('text'),
    text: z.string(),
    marks: z.array(MarkSchema).optional()
});

// Hard break node schema
const HardBreakNodeSchema = z.object({
    type: z.literal('hardBreak')
});

// Inline nodes union
const InlineNodeSchema = z.union([
    TextNodeSchema,
    HardBreakNodeSchema
]);

// Block nodes schemas
const ParagraphNodeSchema = z.object({
    type: z.literal('paragraph'),
    content: z.array(InlineNodeSchema).optional(),
    attrs: z.record(z.any()).optional()
});

const HeadingNodeSchema = z.object({
    type: z.literal('heading'),
    attrs: z.object({
        level: z.number().min(1).max(6)
    }),
    content: z.array(InlineNodeSchema).optional()
});

const CodeBlockNodeSchema = z.object({
    type: z.literal('codeBlock'),
    attrs: z.object({
        language: z.string().optional()
    }).optional(),
    content: z.array(TextNodeSchema).optional()
});

// List item schema
const ListItemNodeSchema = z.object({
    type: z.literal('listItem'),
    content: z.array(z.lazy(() => BlockNodeSchema)).optional()
});

const BulletListNodeSchema = z.object({
    type: z.literal('bulletList'),
    content: z.array(ListItemNodeSchema)
});

const OrderedListNodeSchema = z.object({
    type: z.literal('orderedList'),
    attrs: z.object({
        order: z.number().optional()
    }).optional(),
    content: z.array(ListItemNodeSchema)
});

const BlockquoteNodeSchema = z.object({
    type: z.literal('blockquote'),
    content: z.array(z.lazy(() => BlockNodeSchema))
});

const RuleNodeSchema = z.object({
    type: z.literal('rule')
});

const PanelNodeSchema = z.object({
    type: z.literal('panel'),
    attrs: z.object({
        panelType: z.enum(['info', 'note', 'warning', 'error', 'success']).optional()
    }).optional(),
    content: z.array(z.lazy(() => BlockNodeSchema))
});

// Media node schemas
const MediaNodeSchema = z.object({
    type: z.literal('media'),
    attrs: z.object({
        id: z.string(),
        type: z.enum(['file', 'link', 'external']),
        collection: z.string(),
        width: z.number().optional(),
        height: z.number().optional()
    })
});

const MediaSingleNodeSchema = z.object({
    type: z.literal('mediaSingle'),
    attrs: z.object({
        layout: z.enum(['wrap-left', 'center', 'wrap-right', 'wide', 'full-width']).optional()
    }).optional(),
    content: z.array(MediaNodeSchema)
});

const MediaGroupNodeSchema = z.object({
    type: z.literal('mediaGroup'),
    content: z.array(MediaNodeSchema)
});

// Table schemas
const TableCellNodeSchema = z.object({
    type: z.literal('tableCell'),
    attrs: z.object({
        colspan: z.number().optional(),
        rowspan: z.number().optional(),
        colwidth: z.array(z.number()).optional(),
        background: z.string().optional()
    }).optional(),
    content: z.array(z.lazy(() => BlockNodeSchema)).optional()
});

const TableHeaderNodeSchema = z.object({
    type: z.literal('tableHeader'),
    attrs: z.object({
        colspan: z.number().optional(),
        rowspan: z.number().optional(),
        colwidth: z.array(z.number()).optional(),
        background: z.string().optional()
    }).optional(),
    content: z.array(z.lazy(() => BlockNodeSchema)).optional()
});

const TableRowNodeSchema = z.object({
    type: z.literal('tableRow'),
    content: z.array(z.union([TableCellNodeSchema, TableHeaderNodeSchema]))
});

const TableNodeSchema = z.object({
    type: z.literal('table'),
    attrs: z.object({
        isNumberColumnEnabled: z.boolean().optional(),
        layout: z.enum(['default', 'wide', 'full-width']).optional()
    }).optional(),
    content: z.array(TableRowNodeSchema)
});

// Expand node schema
const ExpandNodeSchema = z.object({
    type: z.literal('expand'),
    attrs: z.object({
        title: z.string()
    }),
    content: z.array(z.lazy(() => BlockNodeSchema))
});

// Block nodes union
const BlockNodeSchema: z.ZodSchema = z.union([
    ParagraphNodeSchema,
    HeadingNodeSchema,
    CodeBlockNodeSchema,
    BulletListNodeSchema,
    OrderedListNodeSchema,
    BlockquoteNodeSchema,
    RuleNodeSchema,
    PanelNodeSchema,
    MediaSingleNodeSchema,
    MediaGroupNodeSchema,
    TableNodeSchema,
    ExpandNodeSchema
]);

// Main ADF Document schema
export const ADFDocumentSchema = z.object({
    version: z.literal(1),
    type: z.literal('doc'),
    content: z.array(BlockNodeSchema).optional()
});