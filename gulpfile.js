const gulp = require('gulp');
const modifyFile = require('gulp-modify-file');
 
gulp.task('build', () => {
  gulp.src('brainfuck.js')
    .pipe(modifyFile((content, path, file) => {
      const start = `
let brainfuckCompiler = (function (module){
`;
      const end = `
return module.exports;
})({exports: {}});
`;
      return `${start}${content}${end}`;
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('default', () => {
  gulp.run('build');
});
