const gulp = require('gulp');
const watch = require('gulp-watch');
const babel = require('gulp-babel');
const modifyFile = require('gulp-modify-file');
const cp = require('child_process');
 
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

gulp.task('watch', () => {
  return watch(['brainfuck.js', 'test.js'], () => {
    cp.exec('npm test', {}, (err, res) => {
      console.log(err ? err : res);
    });
  });
});

gulp.task('default', () => {
  gulp.run('build');
});
