const gulp = require('gulp');
const babel = require('gulp-babel');
const modifyFile = require('gulp-modify-file');
 
gulp.task('build', () => {
  gulp.src('brainfuck.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(modifyFile((content, path, file) => {
      const start = `
var brainfuckCompiler = (function (module){
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
