{
    two: [1,2,3],
    one: {$ref: 'two'},
    controller: {
        create: '../fixture/controller'
    },
    template: '
        |section
        |   header
        |   content
        |       oneBlock
        |       twoBlock
        |   footer
    ',
    someModule: {
        module: '../fixture/someModule'
    },
}