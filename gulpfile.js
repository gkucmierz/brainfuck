const gulp = require('gulp');
const babel = require('gulp-babel');
const modifyFile = require('gulp-modify-file');
 
gulp.task('build', () => {
  gulp.src('brainfuck.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(modifyFile((content, path, file) => {
      const start = `
(function (module){
`;
      const end = `
  window.brainfuckCompiler = window.brainfuckCompiler || module.exports;
})({exports: {}});
`;
      return `${start}${content}${end}`;
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('default', () => {
  gulp.run('build');
});
